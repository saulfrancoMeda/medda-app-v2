import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components';
import { palette } from '@ui/design-system/tokens/palette';

interface MethodRowProps {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly iconColor?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly onPress: () => void;
  /** `'card'` renders with a rounded border; `'list'` renders with a bottom separator. Default: `'list'`. */
  readonly variant?: 'card' | 'list';
}

export function MethodRow({
  icon,
  iconColor = palette.brand[700],
  title,
  subtitle,
  onPress,
  variant = 'list',
}: MethodRowProps) {
  const containerClass =
    variant === 'card'
      ? 'flex-row items-center gap-md rounded-card border border-neutral-200 p-lg active:opacity-80 dark:border-neutral-800'
      : 'flex-row items-center gap-md border-b border-neutral-100 py-lg active:opacity-80 dark:border-neutral-800';

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className={containerClass}>
      <View className="h-10 w-10 items-center justify-center rounded-pill bg-neutral-100 dark:bg-neutral-800">
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text variant="body" className="font-semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.neutral[400]} />
    </Pressable>
  );
}
