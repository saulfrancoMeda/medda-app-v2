import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { authErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPassword'>;

const MIN_PASSWORD = 6;

export function LoginPasswordScreen({ route, navigation }: Props) {
  const { phone, name } = route.params;
  const rawFirst = name.replace(/\*+/g, '').trim().split(' ')[0] ?? '';
  const firstName = rawFirst.length > 2 ? rawFirst : 'Bienvenido';
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = password.length >= MIN_PASSWORD;

  const onChangePassword = (t: string) => {
    setPassword(t);
    if (error) setError(null);
  };

  const onSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    const result = await signIn({ phone, password });
    setLoading(false);
    if (!result.ok) {
      setError(authErrorMessage(result.error));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      {/* Hero oscuro con saludo personalizado */}
      <View
        style={{
          backgroundColor: palette.neutral[900],
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 32,
        }}
      >
        <Text variant="h2" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Hola,
        </Text>
        <Text variant="display" style={{ color: '#FFFFFF', lineHeight: 48 }} numberOfLines={1}>
          {firstName}
        </Text>
      </View>

      {/* Formulario */}
      <View className="flex-1 px-lg" style={{ paddingTop: 28, gap: 12 }}>
        <Input
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          leftIcon="lock-closed-outline"
          secureTextEntry={secure}
          value={password}
          onChangeText={onChangePassword}
          error={error ?? undefined}
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
                color={palette.neutral[400]}
              />
            </Pressable>
          }
        />

        <Pressable
          className="items-end"
          onPress={() => navigation.navigate('RecoverPhone')}
        >
          <Text variant="body" tone="link" className="font-semibold">
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>
      </View>

      {/* Acciones fijas al pie */}
      <View className="gap-md px-lg pb-lg" style={{ paddingTop: 12 }}>
        <Button
          title="Iniciar sesión"
          full
          disabled={!valid}
          loading={loading}
          onPress={onSubmit}
        />

        <Pressable
          className="flex-row justify-center gap-xs"
          onPress={() => navigation.goBack()}
        >
          <Text variant="body" tone="muted">¿Otro número?</Text>
          <Text variant="body" tone="link" className="font-semibold">Cambiar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
