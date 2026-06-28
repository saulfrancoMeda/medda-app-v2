import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, GoldGradient, Input, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { useToast } from '@ui/providers/ToastProvider';
import { lookupErrorMessage } from '@ui/features/auth/authMessages';
import type { AuthStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginPhone'>;

const PHONE_LENGTH = 10;

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
      {/* Gold gradient — logo visible arriba, headline display abajo */}
      <GoldGradient
        radius={0}
        style={{
          flex: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 10,
            alignSelf: 'flex-start',
            shadowColor: '#000',
            shadowOpacity: 0.10,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Logo width={52} height={52} />
        </View>
        <Text variant="display" style={{ color: '#1B1812', lineHeight: 48 }}>
          {'Simplifica\ntus finanzas.'}
        </Text>
      </GoldGradient>

      {/* Form anchored at bottom */}
      <View className="gap-xl px-lg pb-lg" style={{ paddingTop: 32 }}>
        <Input
          label="Número de celular"
          placeholder="10 dígitos"
          leftIcon="call-outline"
          keyboardType="number-pad"
          maxLength={PHONE_LENGTH}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
        />

        <View className="gap-md">
          <Button
            title="Iniciar sesión"
            full
            disabled={!valid}
            loading={loading}
            onPress={onContinue}
          />

          <View className="flex-row justify-center gap-xs">
            <Text variant="body" tone="muted">
              No tengo cuenta.
            </Text>
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
      </View>
    </SafeAreaView>
  );
}
