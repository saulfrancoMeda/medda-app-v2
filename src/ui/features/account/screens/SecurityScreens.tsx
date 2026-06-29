import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isValidNip } from '@domain/wallet/entities/Transfer';
import { Button, Input, Text } from '@ui/design-system/components';
import { accountErrorMessage } from '@ui/features/account/errorMessages';
import { useNipAuthorization } from '@ui/features/common/useNipAuthorization';
import { NipKeypad } from '@ui/features/wallet/components/NipKeypad';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { SuccessView } from '@ui/features/common/SuccessView';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

const MIN_PASSWORD = 6;

function Row({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-md border-b border-neutral-100 py-lg dark:border-neutral-800"
    >
      <Ionicons name={icon} size={24} color={palette.brand[700]} />
      <View className="flex-1">
        <Text variant="body" className="font-semibold">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.neutral[400]} />
    </Pressable>
  );
}

type SecurityProps = NativeStackScreenProps<SectionsStackParamList, 'Security'>;

export function SecurityScreen({ navigation }: SecurityProps) {
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="p-lg">
      <Row
        icon="lock-closed-outline"
        title="Cambiar mi contraseña"
        subtitle="Usas esta contraseña para iniciar sesión"
        onPress={() => navigation.navigate('ChangePassword')}
      />
      <Row
        icon="keypad-outline"
        title="Cambiar mi NIP"
        subtitle="Usas este NIP para autorizar transacciones"
        onPress={() => navigation.navigate('ChangeNip')}
      />
      <Row
        icon="call-outline"
        title="Cambiar mi número"
        subtitle="Usas este número como identificador de tu cuenta"
        onPress={() => navigation.navigate('ChangeNumber')}
      />
      <Row
        icon="mail-outline"
        title="Cambiar mi correo"
        subtitle="Usas este correo para recibir toda la información de tu cuenta"
        onPress={() => navigation.navigate('ChangeEmail')}
      />

    </ScrollView>
  );
}

// --- Establecer NIP inicial (confirma contraseña -> NIP -> confirmar NIP) ----
type SetNipProps = NativeStackScreenProps<SectionsStackParamList, 'SetNip'>;

export function SetNipScreen({ navigation }: SetNipProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [step, setStep] = useState<'password' | 'nip' | 'confirm' | 'done'>('password');
  const [password, setPassword] = useState('');
  const [nip, setNip] = useState('');
  const [confirmNip, setConfirmNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const confirmPassword = async () => {
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.validatePassword(password);
    setLoading(false);
    if (!res.ok) {
      setError(accountErrorMessage(res.error));
      return;
    }
    setStep('nip');
  };

  const onNipComplete = (entered: string) => {
    setNip(entered);
    setConfirmNip('');
    setError(undefined);
    setStep('confirm');
  };

  const onConfirmComplete = async (entered: string) => {
    if (entered !== nip) {
      setError('El NIP no coincide, inténtalo de nuevo');
      setConfirmNip('');
      setNip('');
      setStep('nip');
      return;
    }
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.setNip(password, entered);
    setLoading(false);
    if (!res.ok) {
      setError(accountErrorMessage(res.error));
      setConfirmNip('');
      setNip('');
      setStep('nip');
      return;
    }
    toast.success('Tu NIP se estableció correctamente.');
    setStep('done');
  };

  if (step === 'done') {
    return (
      <SuccessView
        title="NIP establecido"
        description="Ya puedes autorizar tus movimientos con tu nuevo NIP."
        onPress={() => navigation.goBack()}
      />
    );
  }

  if (step === 'password') {
    return (
      <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
        <Text variant="h2">Confirma tu contraseña</Text>
        <Text variant="body" tone="muted">
          Necesitamos confirmar tu identidad para establecer tu NIP.
        </Text>
        <Input
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          leftIcon="lock-closed-outline"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={error}
        />
        <Button
          title="Continuar"
          full
          loading={loading}
          disabled={password.length < MIN_PASSWORD}
          onPress={confirmPassword}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="gap-xs">
        <Text variant="h2" center>
          {step === 'nip' ? 'Crea tu NIP' : 'Confirma tu NIP'}
        </Text>
        <Text variant="body" tone="muted" center>
          {step === 'nip'
            ? 'Crea un NIP de 6 dígitos para autorizar tus movimientos.'
            : 'Vuelve a ingresar tu NIP para confirmarlo.'}
        </Text>
      </View>
      {step === 'nip' ? (
        <NipKeypad value={nip} onChange={setNip} onComplete={onNipComplete} error={error} />
      ) : (
        <NipKeypad
          value={confirmNip}
          onChange={setConfirmNip}
          onComplete={onConfirmComplete}
          loading={loading}
          error={error}
        />
      )}
    </ScrollView>
  );
}

type ValidateEmailProps = NativeStackScreenProps<SectionsStackParamList, 'ValidateEmail'>;

export function ValidateEmailScreen({ route, navigation }: ValidateEmailProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const codeSent = useQuery({
    queryKey: ['account', 'emailValidationCode'],
    queryFn: async () => {
      const res = await accountRepository.sendEmailValidationCode();
      if (!res.ok) throw res.error;
      return true;
    },
    retry: false,
    gcTime: 0,
    staleTime: Infinity,
  });
  const sending = codeSent.isFetching;

  const validate = async () => {
    setLoading(true);
    const res = await accountRepository.validateEmailValidationCode(code);
    setLoading(false);
    if (!res.ok) {
      toast.error(accountErrorMessage(res.error));
      return;
    }
    toast.success('Tu correo se confirmó correctamente.');
    setDone(true);
  };

  if (done) {
    return (
      <SuccessView
        title="Correo confirmado"
        description="¡Listo! Ya puedes disfrutar de todos los beneficios de tu billetera."
        onPress={() => navigation.goBack()}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Text variant="h2">Confirma tu correo</Text>
      <Text variant="body" tone="muted">
        Escribe el código que enviamos a{route.params.email ? ` ${route.params.email}` : ' tu correo'}.
      </Text>
      <Input
        label="Código de verificación"
        placeholder="Ingresa el código"
        leftIcon="keypad-outline"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
      />
      <Button title="Confirmar" full loading={loading} disabled={code.length < 4} onPress={validate} />
      <Button
        title={sending ? 'Enviando código…' : 'Reenviar código'}
        variant="ghost"
        full
        disabled={sending}
        onPress={() => void codeSent.refetch()}
      />
    </ScrollView>
  );
}

// --- Cambiar contraseña (pide NIP para autorizar) ---------------------------
type ChangePwdProps = NativeStackScreenProps<SectionsStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: ChangePwdProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const nipAuth = useNipAuthorization(accountErrorMessage);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const valid =
    oldPassword.length >= MIN_PASSWORD &&
    newPassword.length >= MIN_PASSWORD &&
    newPassword === confirm;

  const authorize = (nip: string) =>
    void nipAuth.submit(
      () => accountRepository.changePassword({ oldPassword, newPassword, nip }),
      () => {
        toast.success('Tu contraseña se actualizó correctamente.');
        navigation.goBack();
      },
    );

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Input label="Contraseña actual" placeholder="Ingresa tu contraseña actual" leftIcon="lock-closed-outline" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
      <Input label="Nueva contraseña" placeholder="Ingresa tu nueva contraseña" leftIcon="lock-closed-outline" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <Input
        label="Confirmar nueva contraseña"
        placeholder="Confirma tu nueva contraseña"
        leftIcon="lock-closed-outline"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        error={confirm.length > 0 && confirm !== newPassword ? 'No coincide' : undefined}
      />
      <Button title="Guardar" full disabled={!valid} onPress={nipAuth.open} />
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

type ChangeNipProps = NativeStackScreenProps<SectionsStackParamList, 'ChangeNip'>;

export function ChangeNipScreen({ navigation }: ChangeNipProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [oldNip, setOldNip] = useState('');
  const [newNip, setNewNip] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const valid =
    password.length >= MIN_PASSWORD &&
    isValidNip(oldNip) &&
    isValidNip(newNip) &&
    newNip === confirm;

  const onSave = async () => {
    if (!valid) return;
    setLoading(true);
    const res = await accountRepository.changeNip({ password, oldNip, newNip });
    setLoading(false);
    if (!res.ok) {
      toast.error(accountErrorMessage(res.error));
      return;
    }
    toast.success('Tu NIP se actualizó correctamente.');
    navigation.goBack();
  };

  const nipField = (set: (t: string) => void) => (t: string) => set(t.replace(/[^0-9]/g, ''));

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Input label="Contraseña" placeholder="Ingresa tu contraseña" leftIcon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} />
      <Input label="NIP actual" placeholder="Ingresa tu NIP actual" leftIcon="keypad-outline" keyboardType="number-pad" maxLength={6} secureTextEntry value={oldNip} onChangeText={nipField(setOldNip)} />
      <Input label="Nuevo NIP" placeholder="Ingresa tu nuevo NIP" leftIcon="keypad-outline" keyboardType="number-pad" maxLength={6} secureTextEntry value={newNip} onChangeText={nipField(setNewNip)} />
      <Input
        label="Confirmar nuevo NIP"
        placeholder="Confirma tu nuevo NIP"
        leftIcon="keypad-outline"
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        value={confirm}
        onChangeText={nipField(setConfirm)}
        error={confirm.length > 0 && confirm !== newNip ? 'No coincide' : undefined}
      />
      <Button title="Guardar" full loading={loading} disabled={!valid} onPress={onSave} />
    </ScrollView>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type ChangeEmailProps = NativeStackScreenProps<SectionsStackParamList, 'ChangeEmail'>;

export function ChangeEmailScreen({ navigation }: ChangeEmailProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const nipAuth = useNipAuthorization(accountErrorMessage);
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState('');
  const valid = EMAIL_RE.test(email) && email === confirm;

  const authorize = (nip: string) =>
    void nipAuth.submit(
      () => accountRepository.changeEmail(email, nip),
      () => {
        toast.success('Tu correo se actualizó correctamente.');
        navigation.goBack();
      },
    );

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Input label="Nuevo correo" placeholder="correo@ejemplo.com" leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Input
        label="Confirmar correo"
        placeholder="correo@ejemplo.com"
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        value={confirm}
        onChangeText={setConfirm}
        error={confirm.length > 0 && confirm !== email ? 'No coincide' : undefined}
      />
      <Button title="Guardar" full disabled={!valid} onPress={nipAuth.open} />
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

type ChangeNumberProps = NativeStackScreenProps<SectionsStackParamList, 'ChangeNumber'>;

export function ChangeNumberScreen({ navigation }: ChangeNumberProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const nipAuth = useNipAuthorization(accountErrorMessage);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [nip, setNip] = useState('');
  const [sent, setSent] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const sendCode = (enteredNip: string) =>
    void nipAuth.submit(
      () => accountRepository.sendNumberChangeCode(phone, enteredNip),
      () => {
        setNip(enteredNip);
        setSent(true);
        toast.success('Te enviamos un código por SMS.');
      },
    );

  const confirm = async () => {
    setConfirming(true);
    const res = await accountRepository.setNumber(phone, code, nip);
    setConfirming(false);
    if (!res.ok) {
      toast.error(accountErrorMessage(res.error));
      return;
    }
    toast.success('Tu número se actualizó. Vuelve a iniciar sesión con el nuevo número.');
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      {!sent ? (
        <>
          <Input
            label="Nuevo número (10 dígitos)"
            placeholder="10 dígitos"
            leftIcon="call-outline"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
          <Button title="Enviar código" full disabled={phone.length !== 10} onPress={nipAuth.open} />
        </>
      ) : (
        <>
          <Text variant="body" tone="muted">
            Ingresa el código que enviamos por SMS al {phone}.
          </Text>
          <Input
            label="Código"
            placeholder="Ingresa el código"
            leftIcon="keypad-outline"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
          />
          <Button title="Confirmar" full loading={confirming} disabled={code.length < 4} onPress={confirm} />
        </>
      )}
      <NipModal
        visible={nipAuth.visible}
        loading={nipAuth.loading}
        error={nipAuth.nipError}
        onSubmit={sendCode}
        onClose={nipAuth.close}
      />
    </ScrollView>
  );
}
