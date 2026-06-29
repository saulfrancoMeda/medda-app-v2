import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
      <View style={styles.hero}>
        <View style={styles.logoCard}>
          <Logo width={72} height={72} />
        </View>
        <Text variant="display" style={styles.heroTitle}>
          {'Simplifica\ntus finanzas.'}
        </Text>
      </View>

      <View className="flex-1 px-lg" style={styles.form}>
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

      <View className="gap-md px-lg pb-lg" style={styles.footer}>
        <Button
          title="Iniciar sesión"
          full
          disabled={!valid}
          loading={loading}
          onPress={onContinue}
        />

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

const styles = StyleSheet.create({
  hero: {
    height: '50%',
    backgroundColor: palette.neutral[900],
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  logoCard: {
    backgroundColor: palette.neutral[0],
    borderRadius: 20,
    padding: 14,
    alignSelf: 'flex-start',
  },
  heroTitle: {
    color: palette.neutral[0],
    lineHeight: 52,
  },
  form: {
    paddingTop: 28,
  },
  footer: {
    paddingTop: 12,
  },
});
