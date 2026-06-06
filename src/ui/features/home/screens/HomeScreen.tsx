import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Button, Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';

// Placeholder de Home tras autenticar. Se reemplaza por el shell real (tabs + Wallet) en la Fase 2.
export function HomeScreen() {
  const { session, signOut } = useAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="flex-1 justify-center gap-lg px-lg">
        <View className="items-center">
          <Logo width={96} height={104} />
        </View>
        <Text variant="display" center>
          Bienvenido 👋
        </Text>
        <Text variant="body" tone="muted" center>
          Sesión iniciada como {session?.username}. (Pantalla temporal — la Fase 2 trae el Wallet.)
        </Text>
        <Button
          title={`Tema: ${colorScheme === 'dark' ? 'oscuro' : 'claro'} (cambiar)`}
          variant="outline"
          full
          onPress={toggleColorScheme}
        />
        <Button title="Cerrar sesión" variant="ghost" full onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}
