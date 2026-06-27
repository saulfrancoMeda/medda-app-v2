import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'] as const;

interface AmountKeypadProps {
  readonly value: string;
  readonly onChange: (next: string) => void;
}

export function AmountKeypad({ value, onChange }: AmountKeypadProps) {
  const handleKey = (key: string) => {
    if (key === '⌫') {
      const next = value.length <= 1 ? '0' : value.slice(0, -1);
      onChange(next.endsWith('.') ? next.slice(0, -1) : next);
      return;
    }
    if (key === '.') {
      if (value.includes('.')) return;
      onChange(value + '.');
      return;
    }
    if (value.includes('.')) {
      const dec = value.split('.')[1] ?? '';
      if (dec.length >= 2) return;
    }
    const next = value === '0' ? key : value + key;
    onChange(next);
  };

  return (
    <View className="gap-sm">
      {([0, 1, 2, 3] as const).map((row) => (
        <View key={row} className="flex-row gap-sm">
          {KEYS.slice(row * 3, row * 3 + 3).map((key, col) => (
            <Pressable
              key={col}
              onPress={() => handleKey(key)}
              accessibilityRole="button"
              accessibilityLabel={key === '⌫' ? 'Borrar' : key}
              className="h-14 flex-1 items-center justify-center rounded-card bg-neutral-100 active:bg-neutral-200 dark:bg-neutral-800 dark:active:bg-neutral-700"
            >
              {key === '⌫' ? (
                <Ionicons name="backspace-outline" size={22} color="#6C6555" />
              ) : (
                <Text variant="h2">{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

export const formatAmountDisplay = (raw: string): string => {
  if (!raw || raw === '0') return '$0';
  const hasDot = raw.includes('.');
  const [intPart = '0', decPart = ''] = raw.split('.');
  const intNum = parseInt(intPart, 10) || 0;
  const intFormatted = intNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return hasDot ? `$${intFormatted}.${decPart}` : `$${intFormatted}`;
};
