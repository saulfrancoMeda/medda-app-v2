import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, Linking, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Button, Logo, Text } from '@ui/design-system/components';

export function LocationGate({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    try {
      setEnabled(await Location.hasServicesEnabledAsync());
    } catch {
      setEnabled(true); // si no se puede determinar, no bloquear
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void check();
    const interval = setInterval(() => void check(), 4000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void check();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [check]);

  if (enabled === null) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator color="#fcd535" />
      </View>
    );
  }

  if (!enabled) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-lg bg-neutral-0 px-lg dark:bg-neutral-950">
        <Logo width={110} height={120} />
        <View className="h-20 w-20 items-center justify-center rounded-pill bg-brand-500">
          <Ionicons name="location" size={36} color="#0a0f14" />
        </View>
        <Text variant="h1" center>
          Activa tu ubicación
        </Text>
        <Text variant="body" tone="muted" center>
          Por seguridad, para usar Medá necesitas activar la ubicación de tu dispositivo.
        </Text>
        <Button title="Abrir ajustes" full onPress={() => void Linking.openSettings()} />
        <Button title="Ya la activé" variant="outline" full onPress={() => void check()} />
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
