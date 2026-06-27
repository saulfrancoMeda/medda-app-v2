import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { useToast } from '@ui/providers/ToastProvider';
import { authErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPassword'>;

const MIN_PASSWORD = 6;

export function LoginPasswordScreen({ route, navigation }: Props) {
  const { phone, name } = route.params;
  const { signIn } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const valid = password.length >= MIN_PASSWORD;

  const onSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    const result = await signIn({ phone, password });
    setLoading(false);
    if (!result.ok) {
      toast.error(authErrorMessage(result.error));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 px-lg pt-2xl">
        <View className="items-center pb-2xl pt-lg">
          <Logo width={96} height={96} />
        </View>

        <View className="gap-xs">
          <Text variant="h1">Bienvenido</Text>
          <Text variant="h2" tone="muted" className="font-normal" numberOfLines={2}>
            {name}
          </Text>
        </View>

        <View className="pt-2xl">
          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            leftIcon="lock-closed-outline"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
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
                  color="#9A9384"
                />
              </Pressable>
            }
          />
        </View>

        <View className="items-end pt-md">
          <Text
            variant="body"
            tone="link"
            className="font-semibold"
            onPress={() => navigation.navigate('RecoverPhone')}
          >
            Recuperar contraseña
          </Text>
        </View>

        <Text variant="caption" tone="muted" className="pt-lg">
          Si tus iniciales no son correctas, verifica que hayas ingresado correctamente tu número
          celular o comunícate a nuestro Centro de Atención.
        </Text>

        <View className="flex-1" />
        <View className="gap-md pb-lg">
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
