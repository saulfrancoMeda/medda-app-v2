import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountError } from '@domain/account/ports/AccountRepository';
import { Button, Input, Text } from '@ui/design-system/components';
import { SuccessView } from '@ui/features/common/SuccessView';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { AuthStackParamList } from '@ui/navigation/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const unlockErrorMessage = (e: AccountError): string =>
  e.type === 'network'
    ? 'Revisa tu conexión a internet'
    : e.type === 'unauthorized'
      ? 'Datos incorrectos. Verifícalos e inténtalo de nuevo.'
      : e.message || 'No se pudo desbloquear tu usuario';

type Props = NativeStackScreenProps<AuthStackParamList, 'Unlock'>;

export function UnlockScreen({ navigation }: Props) {
  const { accountRepository } = useContainer();
  const toast = useToast();
  const [step, setStep] = useState<'data' | 'code' | 'done'>('data');
  const [cellphone, setCellphone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const dataValid = cellphone.length === 10 && EMAIL_RE.test(email);

  const sendCode = async () => {
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.sendUnlockCode(cellphone, email.trim());
    setLoading(false);
    if (!res.ok) {
      setError(unlockErrorMessage(res.error));
      return;
    }
    setCode('');
    setStep('code');
    toast.success('Te enviamos un código de desbloqueo.');
  };

  const validateCode = async () => {
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.validateUnlockCode(cellphone, email.trim(), code);
    setLoading(false);
    if (!res.ok) {
      setError(unlockErrorMessage(res.error));
      return;
    }
    setStep('done');
  };

  if (step === 'done') {
    return (
      <SuccessView
        title="Usuario desbloqueado"
        description="Tu usuario se desbloqueó correctamente. Ya puedes iniciar sesión."
        buttonTitle="Iniciar sesión"
        onPress={() => navigation.popToTop()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <ScrollView contentContainerClassName="gap-md p-lg">
        {step === 'data' ? (
          <>
            <Text variant="h1">Desbloquea tu usuario</Text>
            <Text variant="body" tone="muted">
              Ingresa tu número de celular y tu correo para enviarte un código de desbloqueo.
            </Text>
            <Input
              label="Número de celular (10 dígitos)"
              keyboardType="number-pad"
              maxLength={10}
              value={cellphone}
              onChangeText={(t) => setCellphone(t.replace(/[^0-9]/g, ''))}
            />
            <Input
              label="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={error}
            />
            <Button
              title="Enviar código"
              full
              loading={loading}
              disabled={!dataValid}
              onPress={sendCode}
            />
          </>
        ) : (
          <>
            <Text variant="h1">Validación de seguridad</Text>
            <Text variant="body" tone="muted">
              Ingresa el código que enviamos a tu correo.
            </Text>
            <Input
              label="Código"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
              error={error}
            />
            <Button
              title="Desbloquear"
              full
              loading={loading}
              disabled={code.length < 4}
              onPress={validateCode}
            />
            <Button
              title="Reenviar código"
              variant="ghost"
              full
              disabled={loading}
              onPress={sendCode}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
