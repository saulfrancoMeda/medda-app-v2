import { ActivityIndicator, View } from 'react-native';
import { Logo, Text } from '@ui/design-system/components';

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-neutral-0 dark:bg-neutral-950">
      <Logo width={120} height={120} />
      <ActivityIndicator size="large" color="#FCD535" />
      {message ? (
        <Text variant="body" tone="muted" center>
          {message}
        </Text>
      ) : null}
    </View>
  );
}
