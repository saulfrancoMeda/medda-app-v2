import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
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

function MovementRow({ movement }: { movement: Movement }) {
  const credit = isCredit(movement);
  const reference = movement.reference
    ? ` · ${movement.referenceLabel ?? 'Ref'} ${movement.reference}`
    : '';
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 py-md dark:border-neutral-800">
      <View className="flex-1 pr-md">
        <Text variant="body">{movement.description || 'Movimiento'}</Text>
        <Text variant="caption" tone="muted">
          {formatMovementDate(movement.date)}
          {reference}
        </Text>
      </View>
      <Text variant="body" className={credit ? 'font-semibold text-success' : 'font-semibold'}>
        {formatCurrency(signedAmount(movement))}
      </Text>
    </View>
  );
}

// Pantalla "Mi Billetera" (paridad con Wallet/Screens/Wallet del legacy): saldo, CLABE/cuenta,
// botones de mover dinero y lista de movimientos.
export function WalletScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<WalletStackParamList>>();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const stp = useStpAccount();
  const movements = useMovements(account.data?.id);

  const header = (
    <View className="gap-lg pb-md pt-lg">
      <BalanceCard
        balance={balance.data}
        loading={balance.isPending && Boolean(account.data)}
        clabe={stp.data?.clabe}
        onAbonar={() => navigation.navigate('CashInMethods')}
        onEnviar={() => navigation.navigate('CashOutMethods')}
      />

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
        renderItem={({ item }) => <MovementRow movement={item} />}
        ListHeaderComponent={header}
        contentContainerClassName="px-lg pb-2xl"
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
