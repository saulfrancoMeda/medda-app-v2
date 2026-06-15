import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@domain/shared/money';
import { isCredit, type Movement } from '@domain/wallet/entities/Movement';
import { Text } from '@ui/design-system/components';

export const formatMovementDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
};

const subtitle = (movement: Movement): string => {
  if (movement.provider) return `Vía ${movement.provider}`;
  if (movement.reference) return `${movement.referenceLabel ?? 'Ref'} ${movement.reference}`;
  return '';
};

// Shared transaction row (wallet list, expenses list and home preview). Direction is triple-encoded
// (arrow, sign and color) so color is never the only signal; debits stay in the default ink to avoid
// alarm fatigue — danger is reserved for failed states.
export function MovementRow({ movement, onPress }: { movement: Movement; onPress: () => void }) {
  const credit = isCredit(movement);
  const amount = `${credit ? '+' : '-'}${formatCurrency(Math.abs(movement.amount))}`;
  const detail = subtitle(movement);
  const date = formatMovementDate(movement.date);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${credit ? 'Depósito' : 'Envío'}, ${movement.description || 'Movimiento'}, ${amount}, ${date}`}
      className="flex-row items-center py-sm active:opacity-70"
      style={{ minHeight: 56 }}
    >
      <View
        className={`mr-md h-10 w-10 items-center justify-center rounded-pill ${
          credit ? 'bg-successSoft dark:bg-neutral-800' : 'bg-neutral-100 dark:bg-neutral-800'
        }`}
      >
        <Ionicons
          name={credit ? 'arrow-down' : 'arrow-up'}
          size={20}
          color={credit ? '#2E8C6A' : '#6C6555'}
        />
      </View>
      <View className="flex-1 justify-center pr-md">
        <Text variant="body" className="font-semibold" numberOfLines={1}>
          {movement.description || 'Movimiento'}
        </Text>
        {detail ? (
          <Text variant="caption" tone="muted" numberOfLines={1} className="mt-1">
            {detail}
          </Text>
        ) : null}
      </View>
      <View className="items-end justify-center">
        <Text variant="body" tone={credit ? 'success' : 'default'} className="font-semibold">
          {amount}
        </Text>
        <Text variant="caption" tone="muted" className="mt-1">
          {date}
        </Text>
      </View>
    </Pressable>
  );
}

// Static skeleton mirroring the row geometry, for loading states (no shimmer dependency).
export function MovementRowSkeleton() {
  return (
    <View className="flex-row items-center py-sm" style={{ minHeight: 56 }}>
      <View className="mr-md h-10 w-10 rounded-pill bg-neutral-100 dark:bg-neutral-800" />
      <View className="flex-1 gap-sm pr-md">
        <View className="h-3 w-2/5 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
        <View className="h-3 w-3/5 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
      </View>
      <View className="h-3 w-16 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
    </View>
  );
}
