import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@domain/shared/money';
import { GoldGradient, Text } from '@ui/design-system/components';
import { palette } from '@ui/design-system/tokens/palette';

export interface BalanceCardAction {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly label: string;
  readonly onPress: () => void;
}

interface BalanceCardProps {
  readonly balance?: number;
  readonly loading?: boolean;
  readonly clabe?: string;
  readonly label?: string;
  /** Quick actions rendered inside the card (balance + what you can do with it = one unit). */
  readonly actions?: readonly BalanceCardAction[];
}

const maskClabe = (clabe?: string): string => {
  if (!clabe || clabe.length < 4) return '';
  return `CLABE ·· ${clabe.slice(-4)} · Medá`;
};

export function BalanceCard({
  balance,
  loading = false,
  clabe,
  label = 'Tu saldo disponible',
  actions,
}: BalanceCardProps) {
  const masked = maskClabe(clabe);
  return (
    <GoldGradient radius={26} style={{ padding: 24 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-ink" style={{ opacity: 0.72 }}>
          {label}
        </Text>
        <View className="rounded-pill px-sm py-1" style={{ backgroundColor: palette.neutral[900] }}>
          <Text
            variant="caption"
            className="font-bold tracking-widest"
            style={{ color: palette.brand[500] }}
          >
            MXN
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="h-14 justify-center">
          <ActivityIndicator color={palette.neutral[900]} />
        </View>
      ) : (
        <Text variant="display" className="text-ink" style={{ marginTop: 8, fontVariant: ['tabular-nums'] }}>
          {balance !== undefined ? formatCurrency(balance) : '—'}
        </Text>
      )}

      {masked ? (
        <Text
          variant="caption"
          className="font-mono text-ink"
          style={{ opacity: 0.66, marginTop: 12 }}
        >
          {masked}
        </Text>
      ) : null}

      {actions && actions.length > 0 ? (
        <View className="flex-row justify-between" style={{ marginTop: 16 }}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={action.onPress}
              className="flex-1 items-center gap-xs active:opacity-80"
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-pill"
                style={{ backgroundColor: palette.neutral[900] }}
              >
                <Ionicons name={action.icon} size={22} color={palette.brand[500]} />
              </View>
              <Text variant="caption" className="text-ink" style={{ opacity: 0.72 }}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </GoldGradient>
  );
}
