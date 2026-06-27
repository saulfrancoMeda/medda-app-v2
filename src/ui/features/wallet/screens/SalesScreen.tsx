import { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { formatCurrency } from '@domain/shared/money';
import { expensesTotal, isExpense, type Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { GoldGradient, Text } from '@ui/design-system/components';
import { MovementGroupCard, MovementRowSkeleton, getDateLabel } from '@ui/features/wallet/components/MovementRow';
import { useDefaultAccount, useMovements } from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList } from '@ui/navigation/types';

type MovementGroup = { label: string; movements: Movement[] };

const groupByDate = (movements: readonly Movement[]): MovementGroup[] => {
  const groups: MovementGroup[] = [];
  let current: MovementGroup | null = null;
  for (const m of movements) {
    const label = getDateLabel(m.date);
    if (!current || current.label !== label) {
      current = { label, movements: [] };
      groups.push(current);
    }
    current.movements.push(m);
  }
  return groups;
};

const MONTHS_FULL = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];


export function SalesScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const account = useDefaultAccount();
  const movements = useMovements(account.data?.id);
  const expenses = useMemo(
    () => (movements.data?.movements ?? []).filter(isExpense),
    [movements.data],
  );
  const total = useMemo(() => expensesTotal(expenses), [expenses]);
  const loading = movements.isPending && Boolean(account.data);
  const groups = useMemo(() => groupByDate(expenses), [expenses]);

  const now = new Date();
  const period = `${MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}`;

  const openDetail = (m: Movement) =>
    tabNav.navigate('Wallet', { screen: 'MovementDetail', params: { movement: m } });

  const header = (
    <View className="gap-lg pb-sm pt-lg">
      <GoldGradient radius={20} style={{ padding: 20 }}>
        <View className="flex-row items-center gap-xs" style={{ marginBottom: 6 }}>
          <Ionicons name="trending-up-outline" size={15} color="rgba(27,24,18,0.65)" />
          <Text style={{ color: '#1B1812', opacity: 0.65, fontSize: 13 }}>Mis gastos</Text>
        </View>
        <Text variant="display" className="text-ink">
          {formatCurrency(total)}
        </Text>
        <View className="flex-row items-center justify-between" style={{ marginTop: 8 }}>
          <Text style={{ color: '#1B1812', opacity: 0.5, fontSize: 12 }}>
            {expenses.length} movimiento{expenses.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ color: '#1B1812', opacity: 0.5, fontSize: 12 }}>{period}</Text>
        </View>
      </GoldGradient>

      {loading ? (
        <View className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <View className="bg-neutral-50 px-md py-xs dark:bg-neutral-900">
            <View className="h-3 w-12 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
          </View>
          <View className="px-md">
            {Array.from({ length: 4 }, (_, i) => (
              <View key={i}>
                {i > 0 ? <View className="h-px bg-neutral-100 dark:bg-neutral-800" /> : null}
                <MovementRowSkeleton />
              </View>
            ))}
          </View>
        </View>
      ) : groups.length > 0 ? (
        <Text variant="caption" className="font-semibold text-neutral-500 dark:text-neutral-400">
          DETALLE DE GASTOS
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <FlatList
        data={groups}
        keyExtractor={(g) => g.label}
        renderItem={({ item }) => (
          <MovementGroupCard label={item.label} movements={item.movements} onPress={openDetail} />
        )}
        ItemSeparatorComponent={() => <View className="h-sm" />}
        contentContainerClassName="px-md pb-2xl"
        ListHeaderComponent={header}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          loading ? null : (
            <View className="items-center gap-sm pt-xl">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <Ionicons name="trending-up-outline" size={26} color="#9A9384" />
              </View>
              <Text variant="body" className="font-semibold">Sin gastos registrados</Text>
              <Text variant="caption" tone="muted" center>
                Tus envíos y transferencias aparecerán aquí.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
