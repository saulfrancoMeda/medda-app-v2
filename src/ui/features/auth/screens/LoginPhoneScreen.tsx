import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Logo, Text } from '@ui/design-system/components';
import type { AuthStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

const PHONE_LENGTH = 10;

// Paso 1 del login (paridad con Login.js): captura el teléfono de 10 dígitos.
// TODO: al continuar, llamar GET /public/user/name para traer el nombre real (hoy stub).
export function LoginPhoneScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const valid = phone.length === PHONE_LENGTH;

  const onContinue = () => {
    if (!valid) {
      setError('Ingresa un teléfono de 10 dígitos');
      return;
    }
    setError(undefined);
    navigation.navigate('LoginPassword', { phone, name: 'Saul Franco' });
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

          <Button title="Continuar" full disabled={!valid} onPress={onContinue} />

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
