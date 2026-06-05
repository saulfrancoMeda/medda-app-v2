import './global.css';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Button, Text } from '@ui/design-system/components';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-neutral-950">
        <View className="flex-1 items-center justify-center gap-md px-lg">
          <View className="h-16 w-16 items-center justify-center rounded-card bg-brand-500">
            <Text variant="h1" tone="default">
              M
            </Text>
          </View>
          <Text variant="h1" tone="inverse">
            Medá Agentes
          </Text>
          <Text variant="body" tone="muted" center>
            Base lista: RN 0.85 · TypeScript strict · NativeWind · arquitectura por capas.
          </Text>
          <Button title="Comenzar" full className="mt-md" />
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
