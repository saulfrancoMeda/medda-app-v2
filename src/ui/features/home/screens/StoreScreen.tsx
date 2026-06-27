import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { expensesTotal, type Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { BalanceCard } from '@ui/features/wallet/components/BalanceCard';
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
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const stackNav = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const [showMaintenance, setShowMaintenance] = useState(false);
  const profile = useProfile();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const movements = useMovements(account.data?.id);
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
  const stp = useStpAccount();
  const p = profile.data;
  const initials = p ? `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase() : '';

  const goWallet = (screen: 'CashInMethods' | 'CashOutMethods' | 'WalletHome') =>
    tabNav.navigate('Wallet', { screen });
  const openDetail = (movement: Movement) =>
    tabNav.navigate('Wallet', { screen: 'MovementDetail', params: { movement } });

  const loadingMovements = movements.isPending && Boolean(account.data);

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <ScrollView contentContainerClassName="gap-lg px-md pb-2xl pt-lg">
        <View className="flex-row items-center gap-md">
          <View className="h-10 w-10 items-center justify-center rounded-pill bg-brand-100 dark:bg-neutral-800">
            {initials ? (
              <Text variant="caption" className="font-bold text-brand-700">
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={20} color="#9A9384" />
            )}
          </View>
          <View className="flex-1">
            <Text variant="caption" tone="muted">
              Hola de nuevo
            </Text>
            <Text variant="body" className="font-semibold">
              {p ? `${p.firstName} ${p.lastName}` : 'Bienvenido'}
            </Text>
          </View>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800"
            accessibilityRole="button"
            accessibilityLabel="Mi QR"
            onPress={() => stackNav.navigate('MyQr')}
          >
            <Ionicons name="qr-code" size={22} color="#6C6555" />
          </Pressable>
        </View>

        <BalanceCard
          balance={balance.data}
          loading={balance.isPending && Boolean(account.data)}
          clabe={stp.data?.clabe}
          actions={[
            { icon: 'arrow-down', label: 'Abonar', onPress: () => goWallet('CashInMethods') },
            { icon: 'arrow-up', label: 'Enviar', onPress: () => goWallet('CashOutMethods') },
            { icon: 'qr-code', label: 'Cobrar', onPress: () => stackNav.navigate('MyQr') },
            { icon: 'time-outline', label: 'Movim.', onPress: () => goWallet('WalletHome') },
          ]}
        />

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
            <Text variant="caption" tone="muted">
              Mis gastos
            </Text>
            <Text variant="h2">{movements.data ? formatCurrency(expenses) : '—'}</Text>
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

        <View>
          <View className="flex-row items-center justify-between pb-sm">
            <Text variant="caption" className="font-bold text-neutral-900 dark:text-neutral-100" style={{ letterSpacing: 0.5 }}>
              TRANSACCIONES RECIENTES
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => goWallet('WalletHome')}
            >
              <Text variant="caption" tone="link" className="font-semibold">
                Ver todas
              </Text>
            </Pressable>
          </View>

          {loadingMovements ? (
            <View className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <View className="bg-neutral-50 px-md py-xs dark:bg-neutral-900">
                <View className="h-3 w-10 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
              </View>
              <View className="px-md">
                {Array.from({ length: 3 }, (_, i) => (
                  <MovementRowSkeleton key={i} />
                ))}
              </View>
            </View>
          ) : recentGroups.length > 0 ? (
            <View className="gap-sm">
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
      </ScrollView>

      <Modal visible={showMaintenance} transparent animationType="fade" onRequestClose={() => setShowMaintenance(false)}>
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
