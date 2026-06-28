import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components';

export const NIP_LENGTH = 6;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'] as const;

const styles = StyleSheet.create({
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotFilled: { backgroundColor: '#1B1812' },
  dotEmpty: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#D6D1C7' },
});

interface NipKeypadProps {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly onComplete?: (nip: string) => void;
  readonly loading?: boolean;
  readonly error?: string;
}

export function NipKeypad({ value, onChange, onComplete, loading = false, error }: NipKeypadProps) {
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (completeTimer.current) clearTimeout(completeTimer.current);
    };
  }, []);

  const handleKey = (key: string) => {
    if (loading) return;
    if (key === '⌫') {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === '' || value.length >= NIP_LENGTH) return;
    const next = value + key;
    onChange(next);
    if (next.length === NIP_LENGTH && onComplete) {
      completeTimer.current = setTimeout(() => onComplete(next), 220);
    }
  };

  return (
    <View className="gap-lg">
      <View className="h-6 flex-row items-center justify-center gap-md">
        {loading ? (
          <ActivityIndicator color="#FCD535" />
        ) : (
          Array.from({ length: NIP_LENGTH }, (_, i) => (
            <View
              key={i}
              style={[styles.dot, i < value.length ? styles.dotFilled : styles.dotEmpty]}
            />
          ))
        )}
      </View>

      {error ? (
        <Text variant="caption" tone="danger" center>
          {error}
        </Text>
      ) : null}

      <View className="gap-sm">
        {([0, 1, 2, 3] as const).map((row) => (
          <View key={row} className="flex-row gap-sm">
            {KEYS.slice(row * 3, row * 3 + 3).map((key, col) =>
              key === '' ? (
                <View key={col} className="h-14 flex-1" />
              ) : (
                <Pressable
                  key={col}
                  onPress={() => handleKey(key)}
                  disabled={loading || (key !== '⌫' && value.length >= NIP_LENGTH)}
                  className="h-14 flex-1 items-center justify-center rounded-card bg-neutral-100 dark:bg-neutral-800"
                >
                  {key === '⌫' ? (
                    <Ionicons name="backspace-outline" size={22} color="#6C6555" />
                  ) : (
                    <Text variant="h2">{key}</Text>
                  )}
                </Pressable>
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
