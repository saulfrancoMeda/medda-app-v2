import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '@domain/shared/money';
import { GoldGradient, Text } from '@ui/design-system/components';

interface BalanceCardProps {
  readonly balance?: number;
  readonly loading?: boolean;
  readonly clabe?: string;
  readonly label?: string;
  readonly onAbonar?: () => void;
  readonly onEnviar?: () => void;
}

const maskClabe = (clabe?: string): string => {
  if (!clabe || clabe.length < 4) return '';
  return `CLABE ·· ${clabe.slice(-4)} · Medá`;
};

function CardButton({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-1 flex-row items-center justify-center gap-xs rounded-md py-md"
      style={{ backgroundColor: 'rgba(27,24,18,0.22)', borderWidth: 1, borderColor: 'rgba(27,24,18,0.10)' }}
    >
      <Ionicons name={icon} size={18} color="#1B1812" />
      <Text className="font-semibold text-ink">{title}</Text>
    </Pressable>
  );
}

/** Tarjeta de saldo con gradiente dorado (paridad con el prototipo standalone). */
export function BalanceCard({
  balance,
  loading = false,
  clabe,
  label = 'Tu saldo disponible',
  onAbonar,
  onEnviar,
}: BalanceCardProps) {
  const masked = maskClabe(clabe);
  return (
    <GoldGradient radius={26} style={{ padding: 20 }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-ink" style={{ opacity: 0.72 }}>
          {label}
        </Text>
        <View
          className="rounded-pill px-md py-xs"
          style={{ backgroundColor: '#1B1812' }}
        >
          <Text variant="caption" className="font-bold" style={{ color: '#FCD535' }}>
            MXN
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="h-12 justify-center">
          <ActivityIndicator color="#1B1812" />
        </View>
      ) : (
        <Text variant="display" className="text-ink" style={{ marginTop: 2 }}>
          {balance !== undefined ? formatCurrency(balance) : '—'}
        </Text>
      )}

      {masked ? (
        <Text variant="caption" className="font-mono text-ink" style={{ opacity: 0.66 }}>
          {masked}
        </Text>
      ) : null}

      {onAbonar && onEnviar ? (
        <View className="mt-md flex-row gap-sm">
          <CardButton icon="arrow-down" title="Abonar" onPress={onAbonar} />
          <CardButton icon="arrow-up" title="Enviar" onPress={onEnviar} />
        </View>
      ) : null}
    </GoldGradient>
  );
}
