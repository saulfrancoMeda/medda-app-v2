import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Text } from '@ui/design-system/components';
import { recoveryErrorMessage } from '@ui/features/auth/authMessages';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { AuthStackParamList } from '@ui/navigation/types';

const MIN_PASSWORD = 6;

// Paso 1: teléfono -> envía código SMS.
type PhoneProps = NativeStackScreenProps<AuthStackParamList, 'RecoverPhone'>;
export function RecoverPhoneScreen({ navigation }: PhoneProps) {
  const { passwordRecovery } = useContainer();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setLoading(true);
    const res = await passwordRecovery.sendCode(phone);
    setLoading(false);
    if (!res.ok) {
      toast.error(recoveryErrorMessage(res.error));
      return;
    }
    navigation.navigate('RecoverCode', { phone });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <View className="flex-1 px-lg pt-xl">
        <View className="gap-xs">
          <Text variant="h1">Recuperar contraseña</Text>
          <Text variant="body" tone="muted">
            Ingresa tu teléfono y te enviaremos un código por SMS.
          </Text>
        </View>
        <View className="pt-xl">
          <Input
            label="Teléfono"
            placeholder="10 dígitos"
            leftIcon="call-outline"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
        </View>
        <View className="flex-1" />
        <Button
          title="Enviar código"
          full
          loading={loading}
          disabled={phone.length !== 10}
          onPress={onSend}
          className="mb-lg"
        />
      </View>
    </SafeAreaView>
  );
}

// Paso 2: código -> valida.
type CodeProps = NativeStackScreenProps<AuthStackParamList, 'RecoverCode'>;
export function RecoverCodeScreen({ route, navigation }: CodeProps) {
  const { phone } = route.params;
  const { passwordRecovery } = useContainer();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onValidate = async () => {
    setLoading(true);
    const res = await passwordRecovery.validateCode(phone, code);
    setLoading(false);
    if (!res.ok) {
      toast.error(recoveryErrorMessage(res.error));
      return;
    }
    navigation.navigate('RecoverNewPassword', { phone, code });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <View className="flex-1 px-lg pt-xl">
        <View className="gap-xs">
          <Text variant="h1">Ingresa el código</Text>
          <Text variant="body" tone="muted">
            Enviamos un código por SMS al {phone}.
          </Text>
        </View>
        <View className="pt-xl">
          <Input
            label="Código"
            placeholder="Ingresa el código"
            leftIcon="keypad-outline"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
          />
        </View>
        <View className="flex-1" />
        <Button
          title="Validar"
          full
          loading={loading}
          disabled={code.length < 4}
          onPress={onValidate}
          className="mb-lg"
        />
      </View>
    </SafeAreaView>
  );
}

// Paso 3: nueva contraseña.
type NewProps = NativeStackScreenProps<AuthStackParamList, 'RecoverNewPassword'>;
export function RecoverNewPasswordScreen({ route, navigation }: NewProps) {
  const { phone, code } = route.params;
  const { passwordRecovery } = useContainer();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = password.length >= MIN_PASSWORD && password === confirm;

  const onSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    const res = await passwordRecovery.resetPassword(phone, code, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(recoveryErrorMessage(res.error));
      return;
    }
    toast.success('Tu contraseña se actualizó. Inicia sesión con la nueva.');
    navigation.popToTop();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={['bottom']}>
      <View className="flex-1 px-lg pt-xl">
        <View className="gap-xs">
          <Text variant="h1">Nueva contraseña</Text>
          <Text variant="body" tone="muted">
            Crea una contraseña de al menos {MIN_PASSWORD} caracteres.
          </Text>
        </View>
        <View className="gap-md pt-xl">
          <Input label="Nueva contraseña" placeholder="Ingresa tu nueva contraseña" leftIcon="lock-closed-outline" secureTextEntry value={password} onChangeText={setPassword} />
          <Input
            label="Confirmar contraseña"
            placeholder="Confirma tu nueva contraseña"
            leftIcon="lock-closed-outline"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            error={confirm.length > 0 && confirm !== password ? 'No coincide' : undefined}
          />
        </View>
        <View className="flex-1" />
        <Button
          title="Guardar"
          full
          loading={loading}
          disabled={!valid}
          onPress={onSubmit}
          className="mb-lg"
        />
      </View>
    </SafeAreaView>
  );
}
