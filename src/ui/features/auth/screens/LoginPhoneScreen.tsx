import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { useToast } from '@ui/providers/ToastProvider';
import { lookupErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

const PHONE_LENGTH = 10;

// Paso 1 del login (paridad con Login.js): valida el teléfono contra GET /public/user/name,
// que devuelve el nombre (ya enmascarado por el backend) para mostrarlo en el paso 2.
export function LoginPhoneScreen({ navigation }: Props) {
  const { lookupName } = useAuth();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = phone.length === PHONE_LENGTH;

  const onContinue = async () => {
    if (!valid) return;
    setLoading(true);
    const result = await lookupName(phone);
    setLoading(false);
    if (!result.ok) {
      toast.error(lookupErrorMessage(result.error));
      return;
    }
    navigation.navigate('LoginPassword', { phone, name: result.value });
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 px-lg pt-2xl">
        <View className="items-center pb-2xl pt-lg">
          <Logo width={96} height={96} />
        </View>

        <View className="gap-xs">
          <Text variant="h1">Bienvenido,</Text>
          <Text variant="h2" tone="muted" className="font-normal" numberOfLines={2}>
            inicia sesión
          </Text>
        </View>

        <View className="pt-2xl">
          <Input
            label="Número de celular"
            placeholder="Ingresa tu número de celular"
            leftIcon="call-outline"
            keyboardType="number-pad"
            maxLength={PHONE_LENGTH}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View className="flex-1" />

        <View className="gap-md pb-lg">
          <Button title="Iniciar sesión" full disabled={!valid} loading={loading} onPress={onContinue} />

          <View className="flex-row justify-center gap-xs">
            <Text variant="body" tone="muted">
              No tengo cuenta.
            </Text>
            <Text variant="body" tone="link" className="font-semibold">
              Regístrate
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
