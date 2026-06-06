import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { formatCurrency } from '@domain/shared/money';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import { useBalance, useDefaultAccount, useSalesTotal } from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList } from '@ui/navigation/types';

function AmountCard({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1 gap-sm rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
    >
      <Ionicons name={icon} size={24} color="#d7a300" />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="h2">{value !== undefined ? formatCurrency(value) : '—'}</Text>
    </Pressable>
  );
}

// Pantalla "Inicio" (paridad con Store/Main del legacy): saludo + resumen de montos.
export function StoreScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const profile = useProfile();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const salesTotal = useSalesTotal();

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <ScrollView contentContainerClassName="gap-lg p-lg">
        <Text variant="h1">Hola{profile.data ? `, ${profile.data.firstName}` : ''} 👋</Text>

        <Text variant="h2">Resumen de montos</Text>
        <View className="flex-row gap-md">
          <AmountCard
            icon="wallet-outline"
            label="Mi billetera"
            value={balance.data}
            onPress={() => navigation.navigate('Wallet')}
          />
          <AmountCard
            icon="receipt-outline"
            label="Mis gastos"
            value={salesTotal.data}
            onPress={() => navigation.navigate('Sales')}
          />
        </View>

        <Text variant="h2">Servicios Medá</Text>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
        >
          <Ionicons name="flash-outline" size={24} color="#d7a300" />
          <View className="flex-1">
            <Text variant="body" className="font-semibold">
              Pago de servicios
            </Text>
            <Text variant="caption" tone="muted">
              Próximamente
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
