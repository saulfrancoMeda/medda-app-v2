import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';

/** Pantalla temporal con el header del shell, para secciones aún no construidas. */
export function PlaceholderScreen({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <View className="flex-1 items-center justify-center gap-sm px-lg">
        <Text variant="h1" center>
          {title}
        </Text>
        <Text variant="body" tone="muted" center>
          {subtitle ?? 'Próximamente'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
