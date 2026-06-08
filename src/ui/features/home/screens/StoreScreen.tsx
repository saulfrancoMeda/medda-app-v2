import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { BalanceCard } from '@ui/features/wallet/components/BalanceCard';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import { useBalance, useDefaultAccount, useSalesTotal, useStpAccount } from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList, StoreStackParamList } from '@ui/navigation/types';

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable className="flex-1 items-center gap-xs" accessibilityRole="button" onPress={onPress}>
      <View className="h-14 w-14 items-center justify-center rounded-card bg-brand-100">
        <Ionicons name={icon} size={24} color="#97720A" />
      </View>
      <Text variant="caption" tone="muted" center>
        {label}
      </Text>
    </Pressable>
  );
}

function StatTile({
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
      className="flex-1 gap-sm rounded-card border border-neutral-200 bg-neutral-0 p-lg dark:border-neutral-800 dark:bg-neutral-900"
    >
      <View className="h-10 w-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
        <Ionicons name={icon} size={20} color="#97720A" />
      </View>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="h2">{value !== undefined ? formatCurrency(value) : '—'}</Text>
    </Pressable>
  );
}

export function StoreScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const stackNav = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const profile = useProfile();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const salesTotal = useSalesTotal();
  const stp = useStpAccount();
  const p = profile.data;
  const initials = p ? `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase() : '';

  const goWallet = (screen: 'CashInMethods' | 'CashOutMethods' | 'WalletHome') =>
    tabNav.navigate('Wallet', { screen });

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <ScrollView contentContainerClassName="gap-lg p-lg">
        <View className="flex-row items-center gap-md">
          <View className="h-12 w-12 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800">
            {initials ? (
              <Text variant="body" className="font-bold text-brand-700">
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={22} color="#9A9384" />
            )}
          </View>
          <View className="flex-1">
            <Text variant="caption" tone="muted">
              Hola de nuevo 👋
            </Text>
            <Text variant="h2">{p ? `${p.firstName} ${p.lastName}` : 'Bienvenido'}</Text>
          </View>
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-card bg-brand-100"
            accessibilityRole="button"
            accessibilityLabel="Mi QR"
            onPress={() => stackNav.navigate('MyQr')}
          >
            <Ionicons name="qr-code" size={22} color="#97720A" />
          </Pressable>
        </View>

        <BalanceCard
          balance={balance.data}
          loading={balance.isPending && Boolean(account.data)}
          clabe={stp.data?.clabe}
          onAbonar={() => goWallet('CashInMethods')}
          onEnviar={() => goWallet('CashOutMethods')}
        />

        <View className="flex-row gap-sm">
          <QuickAction icon="arrow-down" label="Abonar" onPress={() => goWallet('CashInMethods')} />
          <QuickAction icon="arrow-up" label="Enviar" onPress={() => goWallet('CashOutMethods')} />
          <QuickAction icon="qr-code" label="Cobrar" onPress={() => stackNav.navigate('MyQr')} />
          <QuickAction icon="time-outline" label="Movim." onPress={() => goWallet('WalletHome')} />
        </View>

        <View className="flex-row gap-md">
          <StatTile
            icon="receipt-outline"
            label="Mis gastos"
            value={salesTotal.data}
            onPress={() => tabNav.navigate('Sales')}
          />
          <StatTile
            icon="wallet-outline"
            label="Mi billetera"
            value={balance.data}
            onPress={() => goWallet('WalletHome')}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
