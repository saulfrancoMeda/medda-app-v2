import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isValidNip } from '@domain/wallet/entities/Transfer';
import type { AccountError } from '@domain/account/ports/AccountRepository';
import { Button, Input, Text } from '@ui/design-system/components';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';

const MIN_PASSWORD = 6;

const accountErrorMessage = (e: AccountError): string =>
  e.type === 'unauthorized'
    ? 'Datos incorrectos. Verifica tu contraseña/NIP.'
    : e.type === 'network'
      ? 'Revisa tu conexión a internet'
      : e.message || 'No se pudo completar la operación';

// --- Menú de seguridad ------------------------------------------------------
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
      <Ionicons name={icon} size={24} color="#d7a300" />
      <View className="flex-1">
        <Text variant="body" className="font-semibold">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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

// --- Cambiar contraseña (pide NIP para autorizar) ---------------------------
type ChangePwdProps = NativeStackScreenProps<SectionsStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: ChangePwdProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);

  const valid =
    oldPassword.length >= MIN_PASSWORD &&
    newPassword.length >= MIN_PASSWORD &&
    newPassword === confirm;

  const authorize = async (nip: string) => {
    setLoading(true);
    setNipError(undefined);
    const res = await accountRepository.changePassword({ oldPassword, newPassword, nip });
    setLoading(false);
    if (!res.ok) {
      const msg = accountErrorMessage(res.error);
      setNipError(msg);
      toast.error(msg);
      return;
    }
    setNipVisible(false);
    toast.success('Tu contraseña se actualizó correctamente.');
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Input label="Contraseña actual" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
      <Input label="Nueva contraseña" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <Input
        label="Confirmar nueva contraseña"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        error={confirm.length > 0 && confirm !== newPassword ? 'No coincide' : undefined}
      />
      <Button title="Guardar" full disabled={!valid} onPress={() => setNipVisible(true)} />
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

// --- Cambiar NIP ------------------------------------------------------------
type ChangeNipProps = NativeStackScreenProps<SectionsStackParamList, 'ChangeNip'>;

export function ChangeNipScreen({ navigation }: ChangeNipProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [oldNip, setOldNip] = useState('');
  const [newNip, setNewNip] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const valid =
    password.length >= MIN_PASSWORD &&
    isValidNip(oldNip) &&
    isValidNip(newNip) &&
    newNip === confirm;

  const onSave = async () => {
    if (!valid) return;
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.changeNip({ password, oldNip, newNip });
    setLoading(false);
    if (!res.ok) {
      const msg = accountErrorMessage(res.error);
      setError(msg);
      toast.error(msg);
      return;
    }
    toast.success('Tu NIP se actualizó correctamente.');
    navigation.goBack();
  };

  const nipField = (set: (t: string) => void) => (t: string) => set(t.replace(/[^0-9]/g, ''));

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Input label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <Input label="NIP actual" keyboardType="number-pad" maxLength={6} secureTextEntry value={oldNip} onChangeText={nipField(setOldNip)} />
      <Input label="Nuevo NIP" keyboardType="number-pad" maxLength={6} secureTextEntry value={newNip} onChangeText={nipField(setNewNip)} />
      <Input
        label="Confirmar nuevo NIP"
        keyboardType="number-pad"
        maxLength={6}
        secureTextEntry
        value={confirm}
        onChangeText={nipField(setConfirm)}
        error={confirm.length > 0 && confirm !== newNip ? 'No coincide' : error}
      />
      <Button title="Guardar" full loading={loading} disabled={!valid} onPress={onSave} />
    </ScrollView>
  );
}

// --- Cambiar correo ---------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type ChangeEmailProps = NativeStackScreenProps<SectionsStackParamList, 'ChangeEmail'>;

export function ChangeEmailScreen({ navigation }: ChangeEmailProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);
  const valid = EMAIL_RE.test(email) && email === confirm;

  const authorize = async (nip: string) => {
    setLoading(true);
    setNipError(undefined);
    const res = await accountRepository.changeEmail(email, nip);
    setLoading(false);
    if (!res.ok) {
      const msg = accountErrorMessage(res.error);
      setNipError(msg);
      toast.error(msg);
      return;
    }
    setNipVisible(false);
    toast.success('Tu correo se actualizó correctamente.');
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Input label="Nuevo correo" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <Input
        label="Confirmar correo"
        keyboardType="email-address"
        autoCapitalize="none"
        value={confirm}
        onChangeText={setConfirm}
        error={confirm.length > 0 && confirm !== email ? 'No coincide' : undefined}
      />
      <Button title="Guardar" full disabled={!valid} onPress={() => setNipVisible(true)} />
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

// --- Cambiar número (nuevo número + NIP -> código SMS -> confirmar) ----------
type ChangeNumberProps = NativeStackScreenProps<SectionsStackParamList, 'ChangeNumber'>;

export function ChangeNumberScreen({ navigation }: ChangeNumberProps) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [nip, setNip] = useState('');
  const [sent, setSent] = useState(false);
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const sendCode = async (enteredNip: string) => {
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.sendNumberChangeCode(phone, enteredNip);
    setLoading(false);
    if (!res.ok) {
      const msg = accountErrorMessage(res.error);
      setError(msg);
      toast.error(msg);
      return;
    }
    setNip(enteredNip);
    setNipVisible(false);
    setSent(true);
    toast.success('Te enviamos un código por SMS.');
  };

  const confirm = async () => {
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.setNumber(phone, code, nip);
    setLoading(false);
    if (!res.ok) {
      const msg = accountErrorMessage(res.error);
      setError(msg);
      toast.error(msg);
      return;
    }
    toast.success('Tu número se actualizó. Vuelve a iniciar sesión con el nuevo número.');
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      {!sent ? (
        <>
          <Input
            label="Nuevo número (10 dígitos)"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
          <Button
            title="Enviar código"
            full
            disabled={phone.length !== 10}
            onPress={() => setNipVisible(true)}
          />
        </>
      ) : (
        <>
          <Text variant="body" tone="muted">
            Ingresa el código que enviamos por SMS al {phone}.
          </Text>
          <Input
            label="Código"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
            error={error}
          />
          <Button title="Confirmar" full loading={loading} disabled={code.length < 4} onPress={confirm} />
        </>
      )}
      <NipModal
        visible={nipVisible}
        loading={loading}
        error={error}
        onSubmit={sendCode}
        onClose={() => setNipVisible(false)}
      />
    </ScrollView>
  );
}
