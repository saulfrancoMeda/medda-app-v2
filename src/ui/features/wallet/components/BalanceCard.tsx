import { ActivityIndicator, View } from 'react-native';
import { formatCurrency } from '@domain/shared/money';
import { GoldGradient, Text } from '@ui/design-system/components';

interface BalanceCardProps {
  readonly balance?: number;
  readonly loading?: boolean;
  readonly clabe?: string;
  readonly label?: string;
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
}: BalanceCardProps) {
  const masked = maskClabe(clabe);
  return (
    <GoldGradient radius={26} style={{ padding: 24 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-ink" style={{ opacity: 0.72 }}>
          {label}
        </Text>
        <View
          className="rounded-pill"
          style={{ backgroundColor: '#1B1812', padding: 4 }}
        >
          <Text variant="caption" className="font-bold tracking-widest" style={{ color: '#FCD535', fontSize: 12 }}>
            MXN
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="h-14 justify-center">
          <ActivityIndicator color="#1B1812" />
        </View>
      ) : (
        <Text variant="display" className="text-ink" style={{ marginTop: 8 }}>
          {balance !== undefined ? formatCurrency(balance) : '—'}
        </Text>
      )}

      {masked ? (
        <Text variant="caption" className="font-mono text-ink" style={{ opacity: 0.66, marginTop: 12 }}>
          {masked}
        </Text>
      ) : null}
    </GoldGradient>
  );
}
