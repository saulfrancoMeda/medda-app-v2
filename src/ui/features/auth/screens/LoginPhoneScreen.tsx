import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { lookupErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

const PHONE_LENGTH = 10;

export function LoginPhoneScreen({ navigation }: Props) {
  const { lookupName } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = phone.length === PHONE_LENGTH;

  const onChangePhone = (t: string) => {
    setPhone(t.replace(/[^0-9]/g, ''));
    if (error) setError(null);
  };

  const onContinue = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
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
      {/* Hero oscuro — 50% de la pantalla */}
      <View
        style={{
          height: '50%',
          backgroundColor: palette.neutral[900],
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          paddingHorizontal: 24,
          paddingTop: 36,
          paddingBottom: 36,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 14,
            alignSelf: 'flex-start',
          }}
        >
          <Logo width={72} height={72} />
        </View>
        <Text variant="display" style={{ color: '#FFFFFF', lineHeight: 52 }}>
          {'Simplifica\ntus finanzas.'}
        </Text>
      </View>

      {/* Formulario — ocupa el espacio restante */}
      <View className="flex-1 px-lg" style={{ paddingTop: 28 }}>
        <Input
          label="Número de celular"
          placeholder="10 dígitos"
          leftIcon="call-outline"
          keyboardType="number-pad"
          maxLength={PHONE_LENGTH}
          value={phone}
          onChangeText={onChangePhone}
          error={error ?? undefined}
        />
      </View>

      {/* Acciones fijas al pie */}
      <View className="gap-md px-lg pb-lg" style={{ paddingTop: 12 }}>
        <Button
          title="Iniciar sesión"
          full
          disabled={!valid}
          loading={loading}
          onPress={onContinue}
        />

        {/* Divider + registro */}
        <View className="flex-row items-center gap-md">
          <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          <Text variant="caption" tone="muted">o</Text>
          <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        </View>

        <View className="flex-row justify-center gap-xs">
          <Text variant="body" tone="muted">¿Sin cuenta?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('RegisterPhone')}
          >
            <Text variant="body" tone="link" className="font-semibold">
              Regístrate
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
