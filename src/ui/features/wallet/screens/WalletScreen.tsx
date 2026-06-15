import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Button, Text } from '@ui/design-system/components';
import { BalanceCard } from '@ui/features/wallet/components/BalanceCard';
import { MovementRow, MovementRowSkeleton } from '@ui/features/wallet/components/MovementRow';
import {
  useBalance,
  useDefaultAccount,
  useMovements,
  useStpAccount,
} from '@ui/features/wallet/hooks/useWallet';
import type { WalletStackParamList } from '@ui/navigation/types';

function CopyRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center justify-between py-md">
      <View className="flex-1 pr-md">
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="body">{value}</Text>
      </View>
      <Pressable
        hitSlop={12}
        onPress={() => Clipboard.setStringAsync(value)}
        accessibilityRole="button"
        accessibilityLabel={`Copiar ${label}`}
        className="h-11 w-11 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800"
      >
        <Ionicons name="copy-outline" size={20} color="#6C6555" />
      </Pressable>
    </View>
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

  const header = (
    <View className="gap-lg pb-sm pt-lg">
      <BalanceCard
        balance={balance.data}
        loading={balance.isPending && Boolean(account.data)}
        clabe={stp.data?.clabe}
        actions={[
          {
            icon: 'arrow-down',
            label: 'Abonar',
            onPress: () => navigation.navigate('CashInMethods'),
          },
          {
            icon: 'arrow-up',
            label: 'Enviar',
            onPress: () => navigation.navigate('CashOutMethods'),
          },
        ]}
      />

      <View className="rounded-card border border-neutral-200 px-md dark:border-neutral-800">
        <CopyRow label="CLABE Medá" value={stp.data?.clabe ?? ''} />
        <CopyRow label="Número de cuenta" value={account.data?.accountNumber ?? ''} />
      </View>

      <Text variant="h2">Tus movimientos</Text>
      {movements.isError ? (
        <View className="items-start gap-sm">
          <Text variant="caption" tone="muted">
            No pudimos cargar los movimientos.
          </Text>
          <Button title="Reintentar" variant="link" onPress={() => void movements.refetch()} />
        </View>
      ) : null}
      {loadingMovements ? (
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
        contentContainerClassName="px-md pb-2xl"
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#97720A" />
        }
        ListEmptyComponent={
          loadingMovements || movements.isError ? null : (
            <View className="items-center gap-sm pt-xl">
              <View className="h-14 w-14 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800">
                <Ionicons name="receipt-outline" size={26} color="#9A9384" />
              </View>
              <Text variant="body" className="font-semibold">
                Sin movimientos todavía
              </Text>
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
