import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { isCredit, signedAmount, type Movement } from '@domain/wallet/entities/Movement';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { BalanceCard } from '@ui/features/wallet/components/BalanceCard';
import { useBalance, useDefaultAccount, useMovements, useStpAccount } from '@ui/features/wallet/hooks/useWallet';
import type { WalletStackParamList } from '@ui/navigation/types';

const formatMovementDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
};

function CopyRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center justify-between py-sm">
      <View className="flex-1 pr-md">
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="body">{value}</Text>
      </View>
      <Pressable
        hitSlop={8}
        onPress={() => Clipboard.setStringAsync(value)}
        accessibilityRole="button"
        accessibilityLabel={`Copiar ${label}`}
      >
        <Ionicons name="copy-outline" size={20} color="#9A9384" />
      </Pressable>
    </View>
  );
}

function MovementRow({ movement, onPress }: { movement: Movement; onPress: () => void }) {
  const credit = isCredit(movement);
  const reference = movement.reference
    ? `· ${movement.referenceLabel ?? 'Ref'} ${movement.reference}`
    : '';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center justify-between py-md active:opacity-70"
    >
      <View className="mr-md h-12 w-12 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800">
        <Ionicons name={credit ? 'arrow-down' : 'arrow-up'} size={22} color={credit ? '#2E8C6A' : '#9A9384'} />
      </View>
      <View className="flex-1 pr-md justify-center">
        <Text variant="body" className="font-semibold" numberOfLines={1}>
          {movement.description || 'Movimiento'}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1} className="mt-1">
          {formatMovementDate(movement.date)} {reference}
        </Text>
      </View>
      <Text variant="body" className={credit ? 'font-semibold text-success' : 'font-semibold'}>
        {formatCurrency(signedAmount(movement))}
      </Text>
    </Pressable>
  );
}

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
      <View className="h-14 w-14 items-center justify-center rounded-card bg-brand-100 dark:bg-brand-900">
        <Ionicons name={icon} size={24} color="#97720A" />
      </View>
      <Text variant="caption" tone="muted" center>
        {label}
      </Text>
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

  const header = (
    <View className="gap-lg pb-md pt-lg">
      <BalanceCard
        balance={balance.data}
        loading={balance.isPending && Boolean(account.data)}
        clabe={stp.data?.clabe}
      />

      <View className="flex-row gap-sm px-6">
        <QuickAction icon="arrow-down" label="Abonar" onPress={() => navigation.navigate('CashInMethods')} />
        <QuickAction icon="arrow-up" label="Enviar" onPress={() => navigation.navigate('CashOutMethods')} />
      </View>

      <View className="rounded-card border border-neutral-200 px-lg dark:border-neutral-800">
        <CopyRow label="CLABE Medá" value={stp.data?.clabe ?? ''} />
        <CopyRow label="Número de cuenta" value={account.data?.accountNumber ?? ''} />
      </View>

      <Text variant="h2">Tus movimientos</Text>
      {movements.isError ? (
        <Text variant="caption" tone="muted">
          No pudimos cargar los movimientos.
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <FlatList
        data={movements.data?.movements ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MovementRow
            movement={item}
            onPress={() => navigation.navigate('MovementDetail', { movement: item })}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-px bg-neutral-100 dark:bg-neutral-800" />}
        ListHeaderComponent={header}
        contentContainerClassName="px-lg pb-2xl"
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#97720A" />
        }
        ListEmptyComponent={
          movements.isPending && account.data ? (
            <ActivityIndicator className="mt-lg" />
          ) : (
            <Text variant="caption" tone="muted">
              Sin movimientos por ahora.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
