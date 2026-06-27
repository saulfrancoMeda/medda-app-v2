import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@domain/shared/money';
import { isCredit, type Movement } from '@domain/wallet/entities/Movement';
import { Text } from '@ui/design-system/components';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const formatMovementDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const now = new Date();
  if (now.toDateString() === d.toDateString()) return `Hoy · ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) return `Ayer · ${time}`;
  if (d.getFullYear() === now.getFullYear()) return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${time}`;
  return `${d.getDate()}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} · ${time}`;
};

export const getDateLabel = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (now.toDateString() === d.toDateString()) return 'Hoy';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) return 'Ayer';
  if (d.getFullYear() === now.getFullYear()) return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const subtitle = (movement: Movement): string => {
  if (movement.provider) return `Vía ${movement.provider}`;
  if (movement.reference) return `${movement.referenceLabel ?? 'Ref'} ${movement.reference}`;
  return '';
};

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
      style={{ minHeight: 60 }}
    >
      <View
        className={`mr-md h-11 w-11 items-center justify-center rounded-2xl ${
          credit ? 'bg-success/10 dark:bg-neutral-800' : 'bg-neutral-100 dark:bg-neutral-800'
        }`}
      >
        <Ionicons
          name={credit ? 'arrow-down' : 'arrow-up'}
          size={20}
          color={credit ? '#2E8C6A' : '#97720A'}
        />
      </View>
      <View className="flex-1 justify-center pr-sm">
        <Text variant="body" className="font-semibold" numberOfLines={1}>
          {movement.description || 'Movimiento'}
        </Text>
        {detail ? (
          <Text variant="caption" tone="muted" numberOfLines={1} className="mt-0.5">
            {detail}
          </Text>
        ) : null}
      </View>
      <View className="items-end justify-center">
        <Text
          variant="body"
          className="font-bold"
          style={{ color: credit ? '#2E8C6A' : '#1B1812' }}
        >
          {amount}
        </Text>
        <Text variant="caption" tone="muted" className="mt-0.5">
          {date}
        </Text>
      </View>
    </Pressable>
  );
}

export function MovementGroupCard({
  label,
  movements,
  onPress,
}: {
  label: string;
  movements: readonly Movement[];
  onPress: (m: Movement) => void;
}) {
  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <View className="bg-neutral-50 px-md py-xs dark:bg-neutral-900">
        <Text variant="caption" tone="muted" className="font-semibold">
          {label.toUpperCase()}
        </Text>
      </View>
      {movements.map((m, i) => (
        <View key={m.id}>
          {i > 0 ? <View className="mx-md h-px bg-neutral-100 dark:bg-neutral-800" /> : null}
          <View className="px-md">
            <MovementRow movement={m} onPress={() => onPress(m)} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function MovementRowSkeleton() {
  return (
    <View className="flex-row items-center py-sm" style={{ minHeight: 60 }}>
      <View className="mr-md h-11 w-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      <View className="flex-1 gap-sm pr-md">
        <View className="h-3 w-2/5 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
        <View className="h-3 w-3/5 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
      </View>
      <View className="items-end gap-sm">
        <View className="h-3 w-16 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
        <View className="h-2.5 w-20 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
      </View>
    </View>
  );
}
