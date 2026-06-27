import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, GoldGradient, Input, Text } from '@ui/design-system/components';
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
      {/* Compressed amber header — carries the brand + personalizes the session */}
      <GoldGradient
        radius={0}
        style={styles.header}
      >
        <Text variant="h2" style={styles.hi}>
          Hola,
        </Text>
        <Text variant="h1" style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </GoldGradient>

      {/* Password form */}
      <View className="flex-1 px-lg" style={{ paddingTop: 32, gap: 12 }}>
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

        <Pressable
          className="items-end"
          onPress={() => navigation.navigate('RecoverPhone')}
        >
          <Text variant="body" tone="link" className="font-semibold">
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>
      </View>

      <View className="gap-md px-lg pb-lg">
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
          <Text variant="body" tone="muted">
            ¿Otro número?
          </Text>
          <Text variant="body" tone="link" className="font-semibold">
            Cambiar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  hi: {
    color: '#1B1812',
  },
  name: {
    color: '#1B1812',
  },
});
