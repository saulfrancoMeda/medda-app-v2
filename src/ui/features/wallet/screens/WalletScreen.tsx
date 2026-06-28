import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Movement } from '@domain/wallet/entities/Movement';
import type { MovementsPage } from '@domain/wallet/ports/WalletRepository';
import { formatCurrency } from '@domain/shared/money';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Button, GoldGradient, Text } from '@ui/design-system/components';
import { MovementGroupCard, MovementRowSkeleton, getDateLabel } from '@ui/features/wallet/components/MovementRow';
import {
  useBalance,
  useDefaultAccount,
  useInfiniteMovements,
  useStpAccount,
} from '@ui/features/wallet/hooks/useWallet';
import type { WalletStackParamList } from '@ui/navigation/types';

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

function CopyRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  if (!value) return null;
  return (
    <Pressable
      hitSlop={4}
      onPress={() => void Clipboard.setStringAsync(value)}
      accessibilityRole="button"
      accessibilityLabel={`Copiar ${label}`}
      className="flex-row items-center gap-md py-md active:opacity-70"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-100">
        <Ionicons name={icon as never} size={18} color="#97720A" />
      </View>
      <View className="flex-1">
        <Text variant="caption" tone="muted">{label}</Text>
        <Text variant="body" className="font-mono text-sm">{value}</Text>
      </View>
      <Ionicons name="copy-outline" size={18} color="#9A9384" />
    </Pressable>
  );
}

export function WalletScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<WalletStackParamList>>();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const stp = useStpAccount();
  const movementsQuery = useInfiniteMovements(account.data?.id);
  const [query, setQuery] = useState('');

  const allMovements = useMemo(
    () => movementsQuery.data?.pages.flatMap((p: MovementsPage) => p.movements) ?? [],
    [movementsQuery.data],
  );

  const refreshing = balance.isRefetching || movementsQuery.isRefetching;
  const loadingBalance = balance.isPending && Boolean(account.data);
  const loadingMovements = movementsQuery.isPending && Boolean(account.data);

  const onRefresh = () => {
    void account.refetch();
    void balance.refetch();
    void stp.refetch();
    void movementsQuery.refetch();
  };

  const onEndReached = () => {
    if (movementsQuery.hasNextPage && !movementsQuery.isFetchingNextPage) {
      void movementsQuery.fetchNextPage();
    }
  };

  const filteredMovements = useMemo(() => {
    if (!query.trim()) return allMovements;
    const q = query.trim().toLowerCase();
    return allMovements.filter(
      (m) =>
        m.description?.toLowerCase().includes(q) ||
        m.provider?.toLowerCase().includes(q) ||
        m.reference?.toLowerCase().includes(q),
    );
  }, [allMovements, query]);
  const groups = useMemo(() => groupByDate(filteredMovements), [filteredMovements]);

  const masked = stp.data?.clabe ? `CLABE ·· ${stp.data.clabe.slice(-4)} · Medá` : '';
  const openDetail = (m: Movement) => navigation.navigate('MovementDetail', { movement: m });

  const listHeader = (
    <View>
      {/* Hero card — full-width, scrolls with list */}
      <GoldGradient radius={0} style={styles.hero}>
        <View style={styles.balanceHeaderRow}>
          <Text style={styles.caption}>Tu saldo disponible</Text>
          <View style={styles.mxnBadge}>
            <Text style={styles.mxnText}>MXN</Text>
          </View>
        </View>

        {loadingBalance ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#1B1812" />
          </View>
        ) : (
          <Text variant="display" style={[styles.ink, styles.amount]}>
            {balance.data !== undefined ? formatCurrency(balance.data) : '—'}
          </Text>
        )}

        {masked ? <Text style={styles.clabe}>{masked}</Text> : null}

        <View style={styles.actionsRow}>
          {([
            { icon: 'arrow-down' as const, label: 'Abonar', onPress: () => navigation.navigate('CashInMethods') },
            { icon: 'arrow-up' as const, label: 'Enviar', onPress: () => navigation.navigate('CashOutMethods') },
          ]).map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={styles.actionItem}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={styles.actionCircle}>
                <Ionicons name={action.icon} size={22} color="#FCD535" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </GoldGradient>

      {/* CLABE + account copy */}
      <View style={styles.subSection}>
        <View className="rounded-2xl border border-neutral-200 px-md dark:border-neutral-800">
          <View className="border-b border-neutral-100 pb-xs pt-md dark:border-neutral-800">
            <Text variant="caption" className="font-semibold text-neutral-500 dark:text-neutral-400">
              MI CUENTA
            </Text>
          </View>
          <CopyRow label="CLABE Medá" value={stp.data?.clabe ?? ''} icon="card-outline" />
          {stp.data?.clabe && account.data?.accountNumber ? (
            <View className="h-px bg-neutral-100 dark:bg-neutral-800" />
          ) : null}
          <CopyRow
            label="Número de cuenta"
            value={account.data?.accountNumber ?? ''}
            icon="wallet-outline"
          />
        </View>

        {/* Search */}
        {!loadingMovements && !movementsQuery.isError && allMovements.length > 0 ? (
          <View className="flex-row items-center gap-sm overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 px-md dark:border-neutral-800 dark:bg-neutral-900">
            <Ionicons name="search-outline" size={16} color="#9A9384" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar movimientos…"
              placeholderTextColor="#9A9384"
              returnKeyType="search"
              style={{ flex: 1, fontSize: 14, height: 44, color: '#1B1812' }}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Limpiar búsqueda">
                <Ionicons name="close-circle" size={16} color="#9A9384" />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {movementsQuery.isError ? (
          <View className="items-start gap-sm">
            <Text variant="caption" tone="muted">No pudimos cargar los movimientos.</Text>
            <Button title="Reintentar" variant="link" onPress={() => void movementsQuery.refetch()} />
          </View>
        ) : null}

        {loadingMovements ? (
          <View className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <View className="bg-neutral-50 px-md py-xs dark:bg-neutral-900">
              <View className="h-3 w-12 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
            </View>
            <View className="px-md">
              {Array.from({ length: 3 }, (_, i) => (
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
            MIS MOVIMIENTOS
          </Text>
        ) : null}
      </View>
    </View>
  );

  const listFooter = movementsQuery.isFetchingNextPage ? (
    <View style={{ padding: 16, alignItems: 'center' }}>
      <ActivityIndicator color="#97720A" />
    </View>
  ) : null;

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
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight }]}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#97720A" />
        }
        ListEmptyComponent={
          loadingMovements || movementsQuery.isError ? null : query.trim() ? (
            <View className="items-center gap-sm pt-xl px-lg">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <Ionicons name="search-outline" size={26} color="#9A9384" />
              </View>
              <Text variant="body" className="font-semibold">Sin resultados</Text>
              <Text variant="caption" tone="muted" center>
                {'No hay movimientos que coincidan con "' + query + '".'}
              </Text>
            </View>
          ) : (
            <View className="items-center gap-sm pt-xl px-lg">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <Ionicons name="receipt-outline" size={26} color="#9A9384" />
              </View>
              <Text variant="body" className="font-semibold">Sin movimientos todavía</Text>
              <Text variant="caption" tone="muted" center>
                Tus depósitos y envíos aparecerán aquí.
              </Text>
              <Button
                title="Depositar"
                variant="soft"
                size="sm"
                onPress={() => navigation.navigate('CashInMethods')}
                className="mt-sm"
              />
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
  ink: { color: '#1B1812' },
  caption: { color: 'rgba(27,24,18,0.60)', fontSize: 13 },
  balanceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mxnBadge: { backgroundColor: '#1B1812', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  mxnText: { color: '#FCD535', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  loadingRow: { height: 52, justifyContent: 'center' },
  amount: { marginTop: 4, fontVariant: ['tabular-nums'] },
  clabe: { color: 'rgba(27,24,18,0.55)', fontSize: 12, fontFamily: 'monospace', marginTop: 6 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionItem: { flex: 1, alignItems: 'center', gap: 6 },
  actionCircle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#1B1812',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: 'rgba(27,24,18,0.72)', fontSize: 11, fontWeight: '600' },
  subSection: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  listContent: { paddingBottom: 40 },
  itemWrapper: { paddingHorizontal: 16 },
});
