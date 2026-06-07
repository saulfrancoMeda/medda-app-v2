import { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { isValidAmount, isValidClabe, type Bank } from '@domain/wallet/entities/Transfer';
import type { WalletError } from '@domain/wallet/ports/WalletRepository';
import { Button, Input, Text } from '@ui/design-system/components';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { useDefaultAccount, useSpeiBanks } from '@ui/features/wallet/hooks/useWallet';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { WalletStackParamList } from '@ui/navigation/types';

// --- Métodos de envío -------------------------------------------------------
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
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
        iconColor="#d7a300"
        title="Envía a un usuario Medá"
        subtitle="Escanea el QR del destinatario"
        onPress={() => navigation.navigate('CashOutMedaScan')}
      />
      <MethodRow
        icon="paper-plane"
        iconColor="#d7a300"
        title="Transferencia SPEI a Terceros"
        onPress={() => navigation.navigate('CashOutSpeiForm')}
      />
    </ScrollView>
  );
}

// --- Selector de banco ------------------------------------------------------
function BankPicker({ value, onSelect }: { value?: Bank; onSelect: (b: Bank) => void }) {
  const [open, setOpen] = useState(false);
  const banks = useSpeiBanks();
  return (
    <View className="w-full gap-xs">
      <Text variant="caption" tone="muted">
        Banco destino
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="h-12 flex-row items-center justify-between rounded-md border border-neutral-200 bg-neutral-100 px-md dark:border-neutral-700 dark:bg-neutral-800"
      >
        <Text variant="body" tone={value ? 'default' : 'muted'}>
          {value?.name ?? 'Selecciona un banco'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9ca3af" />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)} />
        <View className="max-h-[70%] gap-sm rounded-t-xl bg-neutral-0 p-lg dark:bg-neutral-900">
          <Text variant="h2">Banco destino</Text>
          {banks.isPending ? <Text tone="muted">Cargando bancos…</Text> : null}
          {banks.isError ? <Text tone="muted">No se pudieron cargar los bancos.</Text> : null}
          <FlatList
            data={banks.data ?? []}
            keyExtractor={(b) => b.code}
            renderItem={({ item }) => (
              <Pressable
                className="border-b border-neutral-100 py-md dark:border-neutral-800"
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text variant="body">{item.name}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

// --- Formulario SPEI --------------------------------------------------------
type FormProps = NativeStackScreenProps<WalletStackParamList, 'CashOutSpeiForm'>;

export function CashOutSpeiFormScreen({ navigation }: FormProps) {
  const [clabe, setClabe] = useState('');
  const [bank, setBank] = useState<Bank | undefined>(undefined);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');

  const valid =
    isValidClabe(clabe) && Boolean(bank) && name.trim().length > 0 && isValidAmount(amount);

  const onContinue = () => {
    if (!valid || !bank) return;
    navigation.navigate('CashOutConfirm', {
      draft: {
        cuentaBeneficiario: clabe,
        institucionContraparte: bank.code,
        nombreBeneficiario: name.trim(),
        emailBeneficiario: email.trim() || undefined,
        monto: Number(amount).toFixed(2),
        comment: comment.trim() || undefined,
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Input
        label="CLABE destino (18 dígitos)"
        keyboardType="number-pad"
        maxLength={18}
        value={clabe}
        onChangeText={(t) => setClabe(t.replace(/[^0-9]/g, ''))}
        error={clabe.length > 0 && !isValidClabe(clabe) ? 'CLABE inválida' : undefined}
      />
      <BankPicker value={bank} onSelect={setBank} />
      <Input label="Nombre del beneficiario" value={name} onChangeText={setName} />
      <Input
        label="Email del beneficiario (opcional)"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Monto"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
        error={amount.length > 0 && !isValidAmount(amount) ? 'Monto inválido' : undefined}
      />
      <Input label="Concepto (opcional)" maxLength={25} value={comment} onChangeText={setComment} />
      <Button title="Continuar" full disabled={!valid} onPress={onContinue} />
    </ScrollView>
  );
}

// --- Confirmación + NIP -----------------------------------------------------
const walletErrorMessage = (e: WalletError): string => {
  switch (e.type) {
    case 'unauthorized':
      return 'NIP incorrecto o sesión expirada';
    case 'network':
      return 'Revisa tu conexión a internet';
    case 'unknown':
      return e.message || 'No se pudo completar el envío';
  }
};

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

type ConfirmProps = NativeStackScreenProps<WalletStackParamList, 'CashOutConfirm'>;

export function CashOutConfirmScreen({ route, navigation }: ConfirmProps) {
  const { draft } = route.params;
  const { walletRepository } = useContainer();
  const toast = useToast();
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);

  const authorize = async (nip: string) => {
    setNipError(undefined);
    setLoading(true);
    const nipRes = await walletRepository.validateNip(nip);
    if (!nipRes.ok) {
      setLoading(false);
      const msg = walletErrorMessage(nipRes.error);
      setNipError(msg);
      toast.error(msg);
      return;
    }
    // TODO: obtener ubicación real (expo-location); el legacy la manda en el envío.
    const sendRes = await walletRepository.sendSpei({
      ...draft,
      nip,
      location: { latitude: 0, longitude: 0 },
    });
    setLoading(false);
    if (!sendRes.ok) {
      const msg = walletErrorMessage(sendRes.error);
      setNipError(msg);
      toast.error(msg);
      return;
    }
    setNipVisible(false);
    toast.success('Transferencia enviada correctamente.');
    navigation.navigate('TransactionSuccess', { result: sendRes.value, draft });
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="gap-xs rounded-card bg-brand-500 p-lg">
        <Text className="text-ink">Vas a enviar</Text>
        <Text variant="display" className="text-ink">
          {formatCurrency(Number(draft.monto))}
        </Text>
      </View>

      <View className="rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
        <Row label="Beneficiario" value={draft.nombreBeneficiario} />
        <Row label="CLABE" value={draft.cuentaBeneficiario} />
        {draft.comment ? <Row label="Concepto" value={draft.comment} /> : null}
      </View>

      <Text variant="caption" tone="muted">
        Al continuar, autoriza la transferencia con tu NIP.
      </Text>
      <Button title="Enviar" full onPress={() => setNipVisible(true)} />

      <NipModal
        visible={nipVisible}
        loading={loading}
        error={nipError}
        onSubmit={authorize}
        onClose={() => setNipVisible(false)}
      />
    </ScrollView>
  );
}

// --- Éxito ------------------------------------------------------------------
type SuccessProps = NativeStackScreenProps<WalletStackParamList, 'TransactionSuccess'>;

export function TransactionSuccessScreen({ route, navigation }: SuccessProps) {
  const { result, draft } = route.params;
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="flex-1 justify-center gap-lg p-lg">
      <View className="items-center gap-sm">
        <Ionicons name="checkmark-circle" size={72} color="#10b981" />
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

// --- Medá a Medá: escáner QR ------------------------------------------------
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
        <Ionicons name="camera-outline" size={48} color="#d7a300" />
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

// --- Medá a Medá: monto + NIP -----------------------------------------------
type MedaAmountProps = NativeStackScreenProps<WalletStackParamList, 'CashOutMedaAmount'>;

export function CashOutMedaAmountScreen({ route, navigation }: MedaAmountProps) {
  const { resource } = route.params;
  const account = useDefaultAccount();
  const { walletRepository } = useContainer();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);
  const valid = isValidAmount(amount) && Boolean(account.data);

  const authorize = async (nip: string) => {
    if (!account.data) return;
    setLoading(true);
    setNipError(undefined);
    const res = await walletRepository.transferToUser({
      originAccount: account.data.id,
      resource,
      amount: Number(amount).toFixed(2),
      nip,
      comment: comment.trim() || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      const msg = walletErrorMessage(res.error);
      setNipError(msg);
      toast.error(msg);
      return;
    }
    setNipVisible(false);
    toast.success('Envío realizado correctamente.');
    navigation.popToTop();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Text variant="body" tone="muted">
        Destinatario: {resource}
      </Text>
      <Input
        label="Monto"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
        error={amount.length > 0 && !isValidAmount(amount) ? 'Monto inválido' : undefined}
      />
      <Input label="Concepto (opcional)" maxLength={25} value={comment} onChangeText={setComment} />
      <Button title="Enviar" full disabled={!valid} onPress={() => setNipVisible(true)} />
      <NipModal
        visible={nipVisible}
        loading={loading}
        error={nipError}
        onSubmit={authorize}
        onClose={() => setNipVisible(false)}
      />
    </ScrollView>
  );
}
