import { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isValidNip } from '@domain/wallet/entities/Transfer';
import type { AccountError } from '@domain/account/ports/AccountRepository';
import { Button, Input, Text } from '@ui/design-system/components';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { useContainer } from '@ui/providers/ContainerProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';

const MIN_PASSWORD = 6;

const accountErrorMessage = (e: AccountError): string =>
  e.type === 'unauthorized'
    ? 'Datos incorrectos. Verifica tu contraseña/NIP.'
    : e.type === 'network'
      ? 'Revisa tu conexión a internet'
      : e.message || 'No se pudo completar la operación';

// --- Menú de seguridad ------------------------------------------------------
function Row({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
    >
      <Ionicons name={icon} size={22} color="#d7a300" />
      <Text variant="body" className="flex-1">
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );
}

type SecurityProps = NativeStackScreenProps<SectionsStackParamList, 'Security'>;

export function SecurityScreen({ navigation }: SecurityProps) {
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Row icon="lock-closed-outline" title="Cambiar mi contraseña" onPress={() => navigation.navigate('ChangePassword')} />
      <Row icon="keypad-outline" title="Cambiar mi NIP" onPress={() => navigation.navigate('ChangeNip')} />
    </ScrollView>
  );
}

// --- Cambiar contraseña (pide NIP para autorizar) ---------------------------
type ChangePwdProps = NativeStackScreenProps<SectionsStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: ChangePwdProps) {
  const { accountRepository } = useContainer();
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
      setNipError(accountErrorMessage(res.error));
      return;
    }
    setNipVisible(false);
    Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.');
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
      setError(accountErrorMessage(res.error));
      return;
    }
    Alert.alert('Listo', 'Tu NIP se actualizó correctamente.');
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
