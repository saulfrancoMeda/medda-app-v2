import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight, type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
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

const MONTHS_FULL = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function SalesScreen() {
  const tabBarHeight = useBottomTabBarHeight();
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

  const listHeader = (
    <View>
      {/* Hero card — full-width, scrolls with list */}
      <GoldGradient radius={0} style={styles.hero}>
        <View style={styles.heroLabelRow}>
          <Ionicons name="trending-up-outline" size={14} color="rgba(27,24,18,0.60)" />
          <Text style={styles.caption}>Mis gastos</Text>
        </View>
        <Text
          variant="display"
          style={[styles.ink, { fontVariant: ['tabular-nums'] }]}
        >
          {formatCurrency(total)}
        </Text>
        <View style={styles.heroPeriodRow}>
          <Text style={styles.muted}>
            {expenses.length} movimiento{expenses.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.muted}>{period}</Text>
        </View>
      </GoldGradient>

      {/* Section header */}
      <View style={styles.sectionHeader}>
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
          <Text
            variant="caption"
            className="font-bold text-neutral-900 dark:text-neutral-100"
            style={{ letterSpacing: 0.5 }}
          >
            DETALLE DE GASTOS
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={[]}>
      <AppHeader />
      <FlatList
        data={groups}
        keyExtractor={(g) => g.label}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <MovementGroupCard
              label={item.label}
              movements={item.movements}
              onPress={openDetail}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight }]}
        ListHeaderComponent={listHeader}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View className="items-center gap-sm pt-xl px-lg">
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

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroPeriodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  ink: { color: '#1B1812' },
  caption: { color: 'rgba(27,24,18,0.60)', fontSize: 13 },
  muted: { color: 'rgba(27,24,18,0.50)', fontSize: 12 },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  listContent: { paddingBottom: 40 },
  itemWrapper: { paddingHorizontal: 16 },
});
