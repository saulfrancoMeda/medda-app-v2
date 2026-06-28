import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { findBankByClabe, isValidAmount, isValidClabe, type Bank } from '@domain/wallet/entities/Transfer';
import { Button, Input, Text } from '@ui/design-system/components';
import { walletErrorMessage } from '@ui/features/wallet/errorMessages';
import { useNipAuthorization } from '@ui/features/common/useNipAuthorization';
import { AmountKeypad, formatAmountDisplay } from '@ui/features/wallet/components/AmountKeypad';
import { BankPicker } from '@ui/features/wallet/components/BankPicker';
import { MoneyInput } from '@ui/features/wallet/components/MoneyInput';
import { NipKeypad } from '@ui/features/wallet/components/NipKeypad';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import {
  useBalance,
  useDefaultAccount,
  useInvalidateWallet,
  useSpeiBanks,
} from '@ui/features/wallet/hooks/useWallet';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { WalletStackParamList } from '@ui/navigation/types';

type MethodsProps = NativeStackScreenProps<WalletStackParamList, 'CashOutMethods'>;

function MethodRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-md border-b border-neutral-100 py-lg dark:border-neutral-800"
    >
      <View className="h-10 w-10 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800">
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text variant="body" className="font-semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9A9384" />
    </Pressable>
  );
}

export function CashOutMethodsScreen({ navigation }: MethodsProps) {
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-sm p-lg">
      <Text variant="h1">Envía dinero</Text>
      <Text variant="body" tone="muted" className="pb-md">
        Paga a tus amigos, tus clientes, otros usuarios.
      </Text>
      <MethodRow
        icon="person-circle"
        iconColor="#97720A"
        title="Envía a un usuario Medá"
        subtitle="Escanea el QR del destinatario"
        onPress={() => navigation.navigate('CashOutMedaScan')}
      />
      <MethodRow
        icon="paper-plane"
        iconColor="#97720A"
        title="Transferencia SPEI a Terceros"
        onPress={() => navigation.navigate('CashOutSpeiRecipient')}
      />
    </ScrollView>
  );
}

// --- Paso 1: Destinatario --------------------------------------------------------
type RecipientProps = NativeStackScreenProps<WalletStackParamList, 'CashOutSpeiRecipient'>;

export function CashOutSpeiRecipientScreen({ navigation }: RecipientProps) {
  const banks = useSpeiBanks();
  const [clabe, setClabe] = useState('');
  const [bank, setBank] = useState<Bank | undefined>(undefined);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');

  const valid = isValidClabe(clabe) && Boolean(bank) && name.trim().length > 0;

  const onClabeChange = (text: string) => {
    const next = text.replace(/[^0-9]/g, '');
    setClabe(next);
    const match = findBankByClabe(banks.data ?? [], next);
    if (match) setBank(match);
  };

  const onContinue = () => {
    if (!valid || !bank) return;
    navigation.navigate('CashOutSpeiAmount', {
      recipient: {
        cuentaBeneficiario: clabe,
        institucionContraparte: bank.code,
        nombreBeneficiario: name.trim(),
        emailBeneficiario: email.trim() || undefined,
        comment: comment.trim() || undefined,
      },
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 bg-neutral-0 dark:bg-neutral-950"
        contentContainerClassName="gap-lg p-lg"
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="CLABE destino (18 dígitos)"
          leftIcon="card-outline"
          placeholder="18 dígitos"
          keyboardType="number-pad"
          maxLength={18}
          value={clabe}
          onChangeText={onClabeChange}
          error={clabe.length > 0 && !isValidClabe(clabe) ? 'CLABE inválida' : undefined}
        />
        <BankPicker value={bank} onSelect={setBank} />
        <Input
          label="Nombre del beneficiario"
          leftIcon="person-outline"
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Email del beneficiario (opcional)"
          leftIcon="mail-outline"
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Concepto (opcional)"
          leftIcon="chatbubble-ellipses-outline"
          placeholder="Ej. Renta, préstamo…"
          maxLength={25}
          value={comment}
          onChangeText={setComment}
        />
        <Button title="Continuar" full disabled={!valid} onPress={onContinue} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Paso 2: Monto (héroe) --------------------------------------------------------
type AmountProps = NativeStackScreenProps<WalletStackParamList, 'CashOutSpeiAmount'>;

export function CashOutSpeiAmountScreen({ route, navigation }: AmountProps) {
  const { recipient } = route.params;
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const [amount, setAmount] = useState('0');

  const availableBalance = balance.data ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const overBalance = amountNum > availableBalance && availableBalance > 0;
  const canContinue = amountNum > 0 && !overBalance;

  const onMax = () => setAmount(availableBalance.toFixed(2));

  const onContinue = () => {
    if (!canContinue) return;
    navigation.navigate('CashOutConfirm', {
      draft: { ...recipient, monto: amountNum.toFixed(2) },
    });
  };

  const maskedClabe = recipient.cuentaBeneficiario.length >= 4
    ? `••••${recipient.cuentaBeneficiario.slice(-4)}`
    : recipient.cuentaBeneficiario;

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      {/* Contexto fijo: destinatario */}
      <View className="border-b border-neutral-100 px-lg py-sm dark:border-neutral-800">
        <Text variant="caption" tone="muted">Enviando a</Text>
        <Text variant="body" className="font-semibold">{recipient.nombreBeneficiario}</Text>
        <Text variant="caption" tone="muted" className="font-mono">{maskedClabe}</Text>
      </View>

      {/* Héroe: monto */}
      <View className="flex-1 items-center justify-center gap-md px-lg">
        <Text
          style={{
            fontSize: 52,
            fontWeight: '700',
            textAlign: 'center',
            color: overBalance ? '#C24A30' : undefined,
            fontVariant: ['tabular-nums'],
          }}
          variant="display"
        >
          {formatAmountDisplay(amount)}
        </Text>

        <View className="flex-row items-center gap-sm">
          <Text variant="caption" tone="muted">
            Disponible: {balance.data !== undefined ? formatCurrency(availableBalance) : '—'}
          </Text>
          {availableBalance > 0 ? (
            <Pressable
              onPress={onMax}
              accessibilityRole="button"
              accessibilityLabel="Usar saldo máximo"
              className="rounded-pill bg-brand-100 px-sm py-xs"
            >
              <Text variant="caption" className="font-bold text-brand-700">MAX</Text>
            </Pressable>
          ) : null}
        </View>

        {overBalance ? (
          <Text variant="caption" tone="danger" center>
            El monto supera tu saldo disponible.
          </Text>
        ) : null}
      </View>

      {/* Teclado numérico y CTA */}
      <View className="gap-sm px-lg pb-lg">
        <AmountKeypad value={amount} onChange={setAmount} />
        <Button title="Continuar" full disabled={!canContinue} onPress={onContinue} />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-xs">
      <Text variant="body" tone="muted">
        {label}
      </Text>
      <Text variant="body" className="flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

// --- Paso 3: Confirmar --------------------------------------------------------
type ConfirmProps = NativeStackScreenProps<WalletStackParamList, 'CashOutConfirm'>;

export function CashOutConfirmScreen({ route, navigation }: ConfirmProps) {
  const { draft } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerClassName="gap-lg p-lg">
        <View className="gap-xs rounded-card bg-brand-500 p-lg">
          <Text className="text-ink" variant="caption">Vas a enviar</Text>
          <Text variant="display" className="text-ink" style={{ fontVariant: ['tabular-nums'] }}>
            {formatCurrency(Number(draft.monto))}
          </Text>
        </View>

        <View className="rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
          <Row label="Beneficiario" value={draft.nombreBeneficiario} />
          <Row label="CLABE destino" value={draft.cuentaBeneficiario} />
          {draft.emailBeneficiario ? <Row label="Email" value={draft.emailBeneficiario} /> : null}
          {draft.comment ? <Row label="Concepto" value={draft.comment} /> : null}
        </View>

        <Text variant="caption" tone="muted">
          Al continuar, autorizarás la transferencia con tu NIP de 6 dígitos.
        </Text>
      </ScrollView>

      {/* CTA anclado al fondo — nunca dentro del scroll */}
      <View className="gap-md px-lg pb-lg">
        <Button
          title="Autorizar con NIP"
          full
          onPress={() => navigation.navigate('CashOutNip', { draft })}
        />
      </View>
    </SafeAreaView>
  );
}

// --- Paso 4: NIP full-screen --------------------------------------------------------
type NipScreenProps = NativeStackScreenProps<WalletStackParamList, 'CashOutNip'>;

export function CashOutNipScreen({ route, navigation }: NipScreenProps) {
  const { draft } = route.params;
  const { walletRepository } = useContainer();
  const invalidateWallet = useInvalidateWallet();
  const toast = useToast();
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const authorize = async (completedNip: string) => {
    setLoading(true);
    setError(undefined);
    const res = await walletRepository.sendSpei({
      ...draft,
      nip: completedNip,
      location: { latitude: 0, longitude: 0 },
    });
    setLoading(false);
    if (res.ok) {
      invalidateWallet();
      navigation.replace('TransactionSuccess', { result: res.value, draft });
      return;
    }
    setNip('');
    if (res.error.type === 'unauthorized') {
      setError('NIP incorrecto. Verifícalo e intenta de nuevo.');
    } else {
      toast.error(walletErrorMessage(res.error));
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      {/* Resumen fijo — siempre visible mientras se teclea el NIP */}
      <View className="gap-xs border-b border-neutral-100 px-lg py-md dark:border-neutral-800">
        <Text variant="caption" tone="muted">Autorizando envío a</Text>
        <Text variant="body" className="font-semibold">{draft.nombreBeneficiario}</Text>
        <Text variant="display" className="text-ink dark:text-neutral-50" style={{ fontVariant: ['tabular-nums'] }}>
          {formatCurrency(Number(draft.monto))}
        </Text>
      </View>

      {/* Instrucción */}
      <View className="flex-1 items-center justify-center px-lg">
        <View className="gap-xs">
          <Text variant="h2" center>Ingresa tu NIP</Text>
          <Text variant="caption" tone="muted" center>
            Autoriza la transferencia con tu NIP de 6 dígitos.
          </Text>
        </View>
      </View>

      {/* Teclado NIP */}
      <View className="px-lg pb-lg">
        <NipKeypad
          value={nip}
          onChange={setNip}
          onComplete={(completedNip) => void authorize(completedNip)}
          loading={loading}
          error={error}
        />
      </View>
    </SafeAreaView>
  );
}

type SuccessProps = NativeStackScreenProps<WalletStackParamList, 'TransactionSuccess'>;

export function TransactionSuccessScreen({ route, navigation }: SuccessProps) {
  const { result, draft } = route.params;
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="flex-1 justify-center gap-lg p-lg">
      <View className="items-center gap-sm">
        <Ionicons name="checkmark-circle" size={72} color="#2E8C6A" />
        <Text variant="h1" center>
          ¡Envío exitoso!
        </Text>
        <Text variant="body" tone="muted" center>
          Enviaste {formatCurrency(Number(draft.monto))} a {draft.nombreBeneficiario}
        </Text>
      </View>

      <View className="rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
        <Row label="# Transacción" value={result.id || '—'} />
        {result.claveRastreo ? <Row label="Clave de rastreo" value={result.claveRastreo} /> : null}
        <Row label="CLABE destino" value={draft.cuentaBeneficiario} />
      </View>

      <Button title="Volver a Mi Billetera" full onPress={() => navigation.popToTop()} />
    </ScrollView>
  );
}

type ScanProps = NativeStackScreenProps<WalletStackParamList, 'CashOutMedaScan'>;

export function CashOutMedaScanScreen({ navigation }: ScanProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const scanned = useRef(false);

  if (!permission) {
    return <View className="flex-1 bg-neutral-950" />;
  }
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-md bg-neutral-0 px-lg dark:bg-neutral-950">
        <Ionicons name="camera-outline" size={48} color="#97720A" />
        <Text variant="h2" center>
          Permite la cámara
        </Text>
        <Text variant="body" tone="muted" center>
          Necesitamos la cámara para escanear el QR del usuario Medá.
        </Text>
        <Button title="Permitir cámara" full onPress={() => void requestPermission()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (scanned.current || !data) return;
          scanned.current = true;
          navigation.replace('CashOutMedaAmount', { resource: data });
        }}
      />
      <View className="absolute inset-x-0 bottom-2xl items-center">
        <Text variant="body" className="rounded-pill bg-black/60 px-lg py-sm text-neutral-0">
          Apunta al código QR del destinatario
        </Text>
      </View>
    </View>
  );
}

type MedaAmountProps = NativeStackScreenProps<WalletStackParamList, 'CashOutMedaAmount'>;

export function CashOutMedaAmountScreen({ route, navigation }: MedaAmountProps) {
  const { resource } = route.params;
  const account = useDefaultAccount();
  const { walletRepository } = useContainer();
  const toast = useToast();
  const nipAuth = useNipAuthorization(walletErrorMessage);
  const invalidateWallet = useInvalidateWallet();
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const valid = isValidAmount(amount) && Boolean(account.data);

  const authorize = (nip: string) => {
    if (!account.data) return;
    void nipAuth.submit(
      () =>
        walletRepository.transferToUser({
          originAccount: account.data!.id,
          resource,
          amount: Number(amount).toFixed(2),
          nip,
          comment: comment.trim() || undefined,
        }),
      () => {
        invalidateWallet();
        toast.success('Envío realizado correctamente.');
        navigation.popToTop();
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Text variant="body" tone="muted">
        Destinatario: {resource}
      </Text>
      <MoneyInput label="Monto" value={amount} onChangeValue={setAmount} />
      <Input
        label="Concepto (opcional)"
        leftIcon="chatbubble-ellipses-outline"
        placeholder="Ej. Renta, préstamo…"
        maxLength={25}
        value={comment}
        onChangeText={setComment}
      />
      <Button title="Enviar" full disabled={!valid} onPress={nipAuth.open} />
      <NipModal
        visible={nipAuth.visible}
        loading={nipAuth.loading}
        error={nipAuth.nipError}
        onSubmit={authorize}
        onClose={nipAuth.close}
      />
    </ScrollView>
  );
}
