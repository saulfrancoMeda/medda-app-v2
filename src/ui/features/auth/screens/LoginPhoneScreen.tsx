import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { lookupErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

const PHONE_LENGTH = 10;

// Paso 1 del login (paridad con Login.js): valida el teléfono contra GET /public/user/name,
// que devuelve el nombre (ya enmascarado por el backend) para mostrarlo en el paso 2.
export function LoginPhoneScreen({ navigation }: Props) {
  const { lookupName } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const valid = phone.length === PHONE_LENGTH;

  const onContinue = async () => {
    if (!valid) {
      setError('Ingresa un teléfono de 10 dígitos');
      return;
    }
    setError(undefined);
    setLoading(true);
    const result = await lookupName(phone);
    setLoading(false);
    if (!result.ok) {
      setError(lookupErrorMessage(result.error));
      return;
    }
    navigation.navigate('LoginPassword', { phone, name: result.value });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 justify-center gap-xl px-lg">
        <View className="items-center">
          <Logo width={110} height={120} />
        </View>

        <View className="gap-lg rounded-xl border border-neutral-200 bg-neutral-0 p-lg dark:border-neutral-800 dark:bg-neutral-900">
          <View className="gap-xs">
            <Text variant="h1">Bienvenido</Text>
            <Text variant="body" tone="muted">
              Ingresa tu número de teléfono para continuar
            </Text>
          </View>

          <Input
            label="Teléfono"
            placeholder="10 dígitos"
            keyboardType="number-pad"
            maxLength={PHONE_LENGTH}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
            error={error}
          />

          <Button title="Continuar" full disabled={!valid} loading={loading} onPress={onContinue} />

          <View className="flex-row justify-center gap-xs">
            <Text variant="body" tone="muted">
              No tengo cuenta.
            </Text>
            <Text variant="body" tone="link" className="font-semibold">
              Registrarme
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
