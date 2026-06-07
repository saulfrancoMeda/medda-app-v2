import { useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RecoveryError } from '@domain/auth/ports/PasswordRecovery';
import { Button, Input, Text } from '@ui/design-system/components';
import { useContainer } from '@ui/providers/ContainerProvider';
import type { AuthStackParamList } from '@ui/navigation/types';

const MIN_PASSWORD = 6;

const recoveryErrorMessage = (e: RecoveryError): string => {
  switch (e.type) {
    case 'locked':
      return 'Tu cuenta está bloqueada. Comunícate al Centro de Atención.';
    case 'invalid_code':
      return 'Código incorrecto.';
    case 'network':
      return 'Revisa tu conexión a internet';
    case 'unknown':
      return e.message || 'No se pudo completar la operación';
  }
};

// Paso 1: teléfono -> envía código SMS.
type PhoneProps = NativeStackScreenProps<AuthStackParamList, 'RecoverPhone'>;
export function RecoverPhoneScreen({ navigation }: PhoneProps) {
  const { passwordRecovery } = useContainer();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onSend = async () => {
    setLoading(true);
    setError(undefined);
    const res = await passwordRecovery.sendCode(phone);
    setLoading(false);
    if (!res.ok) {
      setError(recoveryErrorMessage(res.error));
      return;
    }
    navigation.navigate('RecoverCode', { phone });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 justify-center gap-lg px-lg">
        <View className="gap-xs">
          <Text variant="h1">Recuperar contraseña</Text>
          <Text variant="body" tone="muted">
            Ingresa tu teléfono y te enviaremos un código por SMS.
          </Text>
        </View>
        <Input
          label="Teléfono"
          placeholder="10 dígitos"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          error={error}
        />
        <Button title="Enviar código" full loading={loading} disabled={phone.length !== 10} onPress={onSend} />
      </View>
    </SafeAreaView>
  );
}

// Paso 2: código -> valida.
type CodeProps = NativeStackScreenProps<AuthStackParamList, 'RecoverCode'>;
export function RecoverCodeScreen({ route, navigation }: CodeProps) {
  const { phone } = route.params;
  const { passwordRecovery } = useContainer();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onValidate = async () => {
    setLoading(true);
    setError(undefined);
    const res = await passwordRecovery.validateCode(phone, code);
    setLoading(false);
    if (!res.ok) {
      setError(recoveryErrorMessage(res.error));
      return;
    }
    navigation.navigate('RecoverNewPassword', { phone, code });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 justify-center gap-lg px-lg">
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
        <Button title="Validar" full loading={loading} disabled={code.length < 4} onPress={onValidate} />
      </View>
    </SafeAreaView>
  );
}

// Paso 3: nueva contraseña.
type NewProps = NativeStackScreenProps<AuthStackParamList, 'RecoverNewPassword'>;
export function RecoverNewPasswordScreen({ route, navigation }: NewProps) {
  const { phone, code } = route.params;
  const { passwordRecovery } = useContainer();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const valid = password.length >= MIN_PASSWORD && password === confirm;

  const onSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(undefined);
    const res = await passwordRecovery.resetPassword(phone, code, password);
    setLoading(false);
    if (!res.ok) {
      setError(recoveryErrorMessage(res.error));
      return;
    }
    Alert.alert('Listo', 'Tu contraseña se actualizó. Inicia sesión con la nueva.');
    navigation.popToTop();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 justify-center gap-lg px-lg">
        <Text variant="h1">Nueva contraseña</Text>
        <Input label="Nueva contraseña" secureTextEntry value={password} onChangeText={setPassword} />
        <Input
          label="Confirmar contraseña"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          error={
            confirm.length > 0 && confirm !== password ? 'No coincide' : error
          }
        />
        <Button title="Guardar" full loading={loading} disabled={!valid} onPress={onSubmit} />
      </View>
    </SafeAreaView>
  );
}
