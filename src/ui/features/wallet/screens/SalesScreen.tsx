import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@domain/shared/money';
import { categoryChannel } from '@domain/wallet/entities/Category';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { cn } from '@ui/lib/cn';
import { useCategories, useDefaultAccount, useMovements } from '@ui/features/wallet/hooks/useWallet';

const formatDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
};

// Pantalla "Mis gastos" (paridad con Wallet/Screens/Sales): filtra movimientos por categoría
// (canal CAT_<id>) y muestra el total de gastos.
export function SalesScreen() {
  const account = useDefaultAccount();
  const categories = useCategories();
  const [selected, setSelected] = useState<readonly string[]>([]);

  const channels = useMemo(
    () => (selected.length > 0 ? selected.map(categoryChannel) : undefined),
    [selected],
  );
  const movements = useMovements(account.data?.id, channels);
  const total = useMemo(
    () => (movements.data?.movements ?? []).reduce((sum, m) => sum + Math.abs(m.amount), 0),
    [movements.data],
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const header = (
    <View className="gap-md pb-md">
      {categories.data && categories.data.length > 0 ? (
        <>
          <Text variant="h2">Filtra por categoría</Text>
          <View className="flex-row flex-wrap gap-sm">
            {categories.data.map((c) => {
              const active = selected.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggle(c.id)}
                  accessibilityRole="button"
                  className={cn(
                    'rounded-pill border px-md py-sm',
                    active
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-neutral-200 dark:border-neutral-700',
                  )}
                >
                  <Text variant="caption" className={active ? 'text-ink' : ''}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View className="gap-xs rounded-card bg-brand-500 p-lg">
        <Text className="text-ink">Total de gastos</Text>
        <Text variant="display" className="text-ink">
          {formatCurrency(total)}
        </Text>
      </View>

      <Text variant="h2">Movimientos</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <FlatList
        data={movements.data?.movements ?? []}
        keyExtractor={(m) => m.id}
        contentContainerClassName="p-lg pb-2xl"
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between border-b border-neutral-100 py-md dark:border-neutral-800">
            <View className="flex-1 pr-md">
              <Text variant="body">{item.description || 'Movimiento'}</Text>
              <Text variant="caption" tone="muted">
                {formatDate(item.date)}
              </Text>
            </View>
            <Text variant="body" className="font-semibold">
              {formatCurrency(Math.abs(item.amount))}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          movements.isPending && account.data ? (
            <ActivityIndicator className="mt-lg" />
          ) : (
            <Text variant="caption" tone="muted">
              Sin gastos en este filtro.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
