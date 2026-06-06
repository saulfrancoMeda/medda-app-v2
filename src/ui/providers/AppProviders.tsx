import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContainerProvider } from '@ui/providers/ContainerProvider';
import { AuthProvider } from '@ui/providers/AuthProvider';
import { SecurityMonitor } from '@ui/providers/SecurityMonitor';
import { LocationGate } from '@ui/providers/LocationGate';

const queryClient = new QueryClient();

/** Providers raíz: gestos, contenedor (DI), área segura, react-query (datos) y auth. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContainerProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
            <SecurityMonitor>
              <LocationGate>{children}</LocationGate>
            </SecurityMonitor>
          </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ContainerProvider>
    </GestureHandlerRootView>
  );
}
