import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Button, Text } from '@ui/design-system/components';
import { BalanceCard } from '@ui/features/wallet/components/BalanceCard';
import { MovementGroupCard, MovementRowSkeleton, getDateLabel } from '@ui/features/wallet/components/MovementRow';
import {
  useBalance,
  useDefaultAccount,
  useMovements,
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
  const navigation = useNavigation<NativeStackNavigationProp<WalletStackParamList>>();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const stp = useStpAccount();
  const movements = useMovements(account.data?.id);

  const refreshing = balance.isRefetching || movements.isRefetching;
  const onRefresh = () => {
    void account.refetch();
    void balance.refetch();
    void stp.refetch();
    void movements.refetch();
  };

  const loadingMovements = movements.isPending && Boolean(account.data);
  const groups = useMemo(
    () => groupByDate(movements.data?.movements ?? []),
    [movements.data],
  );

  const openDetail = (m: Movement) =>
    navigation.navigate('MovementDetail', { movement: m });

  const header = (
    <View className="gap-lg pb-sm pt-lg">
      <BalanceCard
        balance={balance.data}
        loading={balance.isPending && Boolean(account.data)}
        clabe={stp.data?.clabe}
        actions={[
          { icon: 'arrow-down', label: 'Abonar', onPress: () => navigation.navigate('CashInMethods') },
          { icon: 'arrow-up', label: 'Enviar', onPress: () => navigation.navigate('CashOutMethods') },
        ]}
      />

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
        <CopyRow label="Número de cuenta" value={account.data?.accountNumber ?? ''} icon="wallet-outline" />
      </View>

      {movements.isError ? (
        <View className="items-start gap-sm">
          <Text variant="caption" tone="muted">No pudimos cargar los movimientos.</Text>
          <Button title="Reintentar" variant="link" onPress={() => void movements.refetch()} />
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
                {i > 0 ? <View className="mx-0 h-px bg-neutral-100 dark:bg-neutral-800" /> : null}
                <MovementRowSkeleton />
              </View>
            ))}
          </View>
        </View>
      ) : groups.length > 0 ? (
        <Text variant="caption" className="font-semibold text-neutral-500 dark:text-neutral-400">
          MIS MOVIMIENTOS
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
        ListHeaderComponent={header}
        contentContainerClassName="px-md pb-2xl"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#97720A" />
        }
        ListEmptyComponent={
          loadingMovements || movements.isError ? null : (
            <View className="items-center gap-sm pt-xl">
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
