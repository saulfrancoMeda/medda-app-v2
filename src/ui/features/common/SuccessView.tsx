import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from '@ui/design-system/components';

interface SuccessViewProps {
  readonly title: string;
  readonly description?: string;
  readonly buttonTitle?: string;
  readonly onPress: () => void;
}

export function SuccessView({ title, description, buttonTitle = 'Listo', onPress }: SuccessViewProps) {
  return (
    <View className="flex-1 justify-center gap-lg bg-neutral-0 p-lg dark:bg-neutral-950">
      <View className="items-center gap-md">
        <View className="h-20 w-20 items-center justify-center rounded-pill bg-success/15">
          <Ionicons name="checkmark-circle" size={56} color="#2E8C6A" />
        </View>
        <Text variant="h1" center>
          {title}
        </Text>
        {description ? (
          <Text variant="body" tone="muted" center>
            {description}
          </Text>
        ) : null}
      </View>
      <Button title={buttonTitle} full onPress={onPress} />
    </View>
  );
}
