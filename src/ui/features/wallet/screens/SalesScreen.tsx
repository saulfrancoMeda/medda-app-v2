import { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { formatCurrency } from '@domain/shared/money';
import { expensesTotal, isExpense, type Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { GoldGradient, Text } from '@ui/design-system/components';
import { MovementRow, MovementRowSkeleton } from '@ui/features/wallet/components/MovementRow';
import { useDefaultAccount, useMovements } from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList } from '@ui/navigation/types';

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
  const loading = movements.isPending && Boolean(account.data);

  const openDetail = (movement: Movement) =>
    tabNav.navigate('Wallet', { screen: 'MovementDetail', params: { movement } });

  const header = (
    <View className="gap-lg pb-sm pt-lg">
      <GoldGradient radius={26} style={{ padding: 24 }}>
        <Text className="text-ink" style={{ opacity: 0.72 }}>
          Total de gastos
        </Text>
        <Text variant="display" className="text-ink" style={{ marginTop: 8 }}>
          {formatCurrency(total)}
        </Text>
      </GoldGradient>
      <Text variant="h2">Movimientos</Text>
      {loading ? (
        <View>
          {Array.from({ length: 5 }, (_, i) => (
            <MovementRowSkeleton key={i} />
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <FlatList
        data={expenses}
        keyExtractor={(m) => m.id}
        contentContainerClassName="px-md pb-2xl"
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View className="h-px bg-neutral-100 dark:bg-neutral-800" />}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={true}
        renderItem={({ item }) => <MovementRow movement={item} onPress={() => openDetail(item)} />}
        ListEmptyComponent={
          loading ? null : (
            <Text variant="caption" tone="muted">
              Aún no tienes gastos registrados.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
