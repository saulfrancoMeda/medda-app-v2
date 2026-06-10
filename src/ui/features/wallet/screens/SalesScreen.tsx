import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { formatCurrency } from '@domain/shared/money';
import { expensesTotal, isExpense, type Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { useDefaultAccount, useMovements } from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList } from '@ui/navigation/types';

const formatDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
};

export function SalesScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const account = useDefaultAccount();
  const movements = useMovements(account.data?.id);
  // "Mis gastos" son las salidas: enviar SPEI o transferir a cuentas Medá. Los abonos son ingresos.
  const expenses = useMemo(
    () => (movements.data?.movements ?? []).filter(isExpense),
    [movements.data],
  );
  const total = useMemo(() => expensesTotal(expenses), [expenses]);

  const openDetail = (movement: Movement) =>
    tabNav.navigate('Wallet', { screen: 'MovementDetail', params: { movement } });

  const header = (
    <View className="gap-md pb-md">
      <View className="gap-xs rounded-card bg-brand-500 p-lg">
        <Text className="text-ink">Total de gastos</Text>
        <Text variant="display" className="text-ink">
          {formatCurrency(total)}
        </Text>
      </View>
      <Text variant="h2">Movimientos</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <FlatList
        data={expenses}
        keyExtractor={(m) => m.id}
        contentContainerClassName="p-lg pb-2xl"
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openDetail(item)}
            accessibilityRole="button"
            className="flex-row items-center justify-between border-b border-neutral-100 py-md dark:border-neutral-800"
          >
            <View className="flex-1 pr-md">
              <Text variant="body">{item.description || 'Movimiento'}</Text>
              <Text variant="caption" tone="muted">
                {formatDate(item.date)}
              </Text>
            </View>
            <Text variant="body" className="font-semibold">
              {formatCurrency(Math.abs(item.amount))}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          movements.isPending && account.data ? (
            <ActivityIndicator className="mt-lg" color="#FCD535" />
          ) : (
            <Text variant="caption" tone="muted">
              Aún no tienes gastos registrados.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
