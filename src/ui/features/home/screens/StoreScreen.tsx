import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { expensesTotal, type Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { GoldGradient, Text } from '@ui/design-system/components';
import { MovementGroupCard, MovementRowSkeleton, getDateLabel } from '@ui/features/wallet/components/MovementRow';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import {
  useBalance,
  useDefaultAccount,
  useMovements,
  useStpAccount,
} from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList, StoreStackParamList } from '@ui/navigation/types';

const RECENT_MOVEMENTS = 5;

export function StoreScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const stackNav = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const [showMaintenance, setShowMaintenance] = useState(false);

  const profile = useProfile();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const movements = useMovements(account.data?.id);
  const stp = useStpAccount();

  const expenses = useMemo(() => expensesTotal(movements.data?.movements ?? []), [movements.data]);
  const recent = useMemo(
    () => (movements.data?.movements ?? []).slice(0, RECENT_MOVEMENTS),
    [movements.data],
  );

  type RecentGroup = { label: string; movements: Movement[] };
  const recentGroups = useMemo<RecentGroup[]>(() => {
    const groups: RecentGroup[] = [];
    let current: RecentGroup | null = null;
    for (const m of recent) {
      const label = getDateLabel(m.date);
      if (!current || current.label !== label) {
        current = { label, movements: [] };
        groups.push(current);
      }
      current.movements.push(m);
    }
    return groups;
  }, [recent]);

  const p = profile.data;
  const firstName = p?.firstName ?? '';
  const masked = stp.data?.clabe ? `CLABE ·· ${stp.data.clabe.slice(-4)} · Medá` : '';
  const loadingMovements = movements.isPending && Boolean(account.data);
  const loadingBalance = balance.isPending && Boolean(account.data);

  const goWallet = (screen: 'CashInMethods' | 'CashOutMethods' | 'WalletHome') =>
    tabNav.navigate('Wallet', { screen });
  const openDetail = (movement: Movement) =>
    tabNav.navigate('Wallet', { screen: 'MovementDetail', params: { movement } });

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950" edges={[]}>
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
      >
        {/* ── BALANCE HERO ── */}
        <GoldGradient
          radius={0}
          style={styles.hero}
        >
          {/* Greeting */}
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.caption}>Hola de nuevo</Text>
              <Text variant="h2" style={styles.ink}>{firstName || 'Bienvenido'}</Text>
            </View>
            <Pressable
              style={styles.qrButton}
              onPress={() => stackNav.navigate('MyQr')}
              accessibilityRole="button"
              accessibilityLabel="Mi QR"
            >
              <Ionicons name="qr-code" size={20} color="#1B1812" />
            </Pressable>
          </View>

          {/* Balance */}
          <View style={styles.balanceSection}>
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
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {([
              { icon: 'arrow-down' as const, label: 'Abonar', onPress: () => goWallet('CashInMethods') },
              { icon: 'arrow-up' as const, label: 'Enviar', onPress: () => goWallet('CashOutMethods') },
              { icon: 'qr-code' as const, label: 'Cobrar', onPress: () => stackNav.navigate('MyQr') },
              { icon: 'time-outline' as const, label: 'Movim.', onPress: () => goWallet('WalletHome') },
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

        {/* ── CARDS ── */}
        <View style={styles.cardsSection}>
          <Pressable
            onPress={() => tabNav.navigate('Sales')}
            accessibilityRole="button"
            accessibilityLabel={`Mis gastos, ${movements.data ? formatCurrency(expenses) : 'sin datos'}`}
            className="flex-row items-center gap-md rounded-card border border-neutral-200 p-md active:opacity-70 dark:border-neutral-800"
          >
            <View className="h-10 w-10 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800">
              <Ionicons name="receipt-outline" size={20} color="#6C6555" />
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">Mis gastos</Text>
              <Text variant="h2" style={{ fontVariant: ['tabular-nums'] }}>
                {movements.data ? formatCurrency(expenses) : '—'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9A9384" />
          </Pressable>

          <Pressable
            onPress={() => setShowMaintenance(true)}
            accessibilityRole="button"
            accessibilityLabel="Servicios"
            className="flex-row items-center gap-md rounded-card border border-neutral-200 p-md active:opacity-70 dark:border-neutral-800"
          >
            <View className="h-10 w-10 items-center justify-center rounded-pill bg-brand-100">
              <Ionicons name="apps-outline" size={20} color="#97720A" />
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">Acceso rápido</Text>
              <Text variant="body" className="font-semibold">Servicios</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9A9384" />
          </Pressable>

          {/* Recent transactions */}
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center justify-between">
              <Text
                variant="caption"
                className="font-bold text-neutral-900 dark:text-neutral-100"
                style={{ letterSpacing: 0.5 }}
              >
                TRANSACCIONES RECIENTES
              </Text>
              <Pressable accessibilityRole="button" hitSlop={12} onPress={() => goWallet('WalletHome')}>
                <Text variant="caption" tone="link" className="font-semibold">Ver todas</Text>
              </Pressable>
            </View>

            {loadingMovements ? (
              <View className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <View className="bg-neutral-50 px-md py-xs dark:bg-neutral-900">
                  <View className="h-3 w-10 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
                </View>
                <View className="px-md">
                  {Array.from({ length: 3 }, (_, i) => <MovementRowSkeleton key={i} />)}
                </View>
              </View>
            ) : recentGroups.length > 0 ? (
              <View style={{ gap: 8 }}>
                {recentGroups.map((group) => (
                  <MovementGroupCard
                    key={group.label}
                    label={group.label}
                    movements={group.movements}
                    onPress={openDetail}
                  />
                ))}
              </View>
            ) : (
              <Text variant="caption" tone="muted">
                {movements.isError
                  ? 'No pudimos cargar tus transacciones.'
                  : 'Tus depósitos y envíos aparecerán aquí.'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showMaintenance}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMaintenance(false)}
      >
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => setShowMaintenance(false)}
        />
        <View className="flex-1 items-center justify-center px-lg">
          <View className="w-full gap-lg rounded-2xl bg-neutral-0 p-xl dark:bg-neutral-900">
            <View className="items-center gap-md">
              <View className="h-16 w-16 items-center justify-center rounded-pill bg-brand-100">
                <Ionicons name="construct-outline" size={32} color="#97720A" />
              </View>
              <Text variant="h2" center>En mantenimiento</Text>
              <Text variant="body" tone="muted" center>
                Estamos mejorando los servicios para darte una mejor experiencia. Pronto estarán disponibles.
              </Text>
            </View>
            <Pressable
              onPress={() => setShowMaintenance(false)}
              accessibilityRole="button"
              className="items-center rounded-pill bg-brand-400 py-md"
            >
              <Text variant="body" className="font-semibold text-neutral-900">Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  // Hero card — full-width, rounds only at bottom
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  cardsSection: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  // Hero internals
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  ink: { color: '#1B1812' },
  caption: { color: 'rgba(27,24,18,0.60)', fontSize: 13 },
  qrButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(27,24,18,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceSection: { marginTop: 20 },
  balanceHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mxnBadge: { backgroundColor: '#1B1812', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  mxnText: { color: '#FCD535', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  loadingRow: { height: 52, justifyContent: 'center' },
  amount: { marginTop: 4, fontVariant: ['tabular-nums'] },
  clabe: { color: 'rgba(27,24,18,0.55)', fontSize: 12, fontFamily: 'monospace', marginTop: 6 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
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
});
