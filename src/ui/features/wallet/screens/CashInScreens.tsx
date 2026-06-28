import { Pressable, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '@ui/design-system/components';
import { useStpAccount } from '@ui/features/wallet/hooks/useWallet';
import type { WalletStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

function MethodRow({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
    >
      <Ionicons name="swap-horizontal" size={24} color={palette.brand[700]} />
      <View className="flex-1">
        <Text variant="body" className="font-semibold">
          {title}
        </Text>
        <Text variant="caption" tone="muted">
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.neutral[400]} />
    </Pressable>
  );
}

type MethodsProps = NativeStackScreenProps<WalletStackParamList, 'CashInMethods'>;

export function CashInMethodsScreen({ navigation }: MethodsProps) {
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Text variant="body" tone="muted">
        Elige cómo quieres abonar dinero a tu billetera.
      </Text>
      <MethodRow
        title="Transferencia SPEI"
        subtitle="Recibe dinero desde cualquier banco a tu CLABE"
        onPress={() => navigation.navigate('CashInSpei')}
      />
    </ScrollView>
  );
}

export function CashInSpeiScreen() {
  const stp = useStpAccount();
  const clabe = stp.data?.clabe ?? '';

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Text variant="body" tone="muted">
        Transfiere por SPEI a la siguiente CLABE desde tu banco. Tu saldo se verá reflejado en
        menos de 2 horas.
      </Text>

      <View className="gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
        <View>
          <Text variant="caption" tone="muted">
            Banco
          </Text>
          <Text variant="body">STP — Sistema de Transferencias y Pagos</Text>
        </View>
        <View className="flex-row items-end justify-between">
          <View className="flex-1 pr-md">
            <Text variant="caption" tone="muted">
              CLABE Medá
            </Text>
            <Text variant="h2" style={{ fontVariant: ['tabular-nums'] }}>{clabe || '—'}</Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => clabe && Clipboard.setStringAsync(clabe)}
            accessibilityRole="button"
            accessibilityLabel="Copiar CLABE"
          >
            <Ionicons name="copy-outline" size={22} color={palette.neutral[400]} />
          </Pressable>
        </View>
      </View>

      <Text variant="caption" tone="muted">
        Verifica que la CLABE sea correcta antes de transferir. Solo se aceptan depósitos desde
        cuentas a tu nombre.
      </Text>
    </ScrollView>
  );
}
