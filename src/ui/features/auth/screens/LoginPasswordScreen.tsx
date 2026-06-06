import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { authErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPassword'>;

const MIN_PASSWORD = 6;

// Paso 2 del login (paridad con Login2.js): contraseña + autenticación.
export function LoginPasswordScreen({ route, navigation }: Props) {
  const { phone, name } = route.params;
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const valid = password.length >= MIN_PASSWORD;

  const onSubmit = async () => {
    if (!valid) return;
    setError(undefined);
    setLoading(true);
    const result = await signIn({ phone, password });
    setLoading(false);
    if (!result.ok) {
      setError(authErrorMessage(result.error));
    }
    // En éxito, el RootNavigator cambia solo a la app (status -> signedIn).
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 justify-center gap-xl px-lg">
        <View className="items-center">
          <Logo width={110} height={120} />
        </View>

        <View className="gap-lg rounded-xl border border-neutral-200 bg-neutral-0 p-lg dark:border-neutral-800 dark:bg-neutral-900">
          <View className="gap-xs">
            <Text variant="h1">Bienvenido,</Text>
            <Text variant="body" tone="muted">
              {name}
            </Text>
          </View>

          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            error={error}
            rightSlot={
              <Pressable
                onPress={() => setSecure((s) => !s)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={secure ? 'Mostrar contraseña' : 'Ocultar contraseña'}
              >
                <Ionicons
                  name={secure ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#9ca3af"
                />
              </Pressable>
            }
          />

          <View className="items-end">
            <Text variant="caption" tone="link" className="font-semibold">
              Recuperar contraseña
            </Text>
          </View>

          <Text variant="caption" tone="muted">
            Si tus iniciales no son correctas, verifica que hayas ingresado correctamente tu
            número celular o comunícate a nuestro Centro de Atención.
          </Text>

          <Button title="Iniciar sesión" full disabled={!valid} loading={loading} onPress={onSubmit} />

          <Pressable className="flex-row justify-center gap-xs" onPress={() => navigation.goBack()}>
            <Text variant="body" tone="muted">
              ¿Otro número?
            </Text>
            <Text variant="body" tone="link" className="font-semibold">
              Cambiar
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
