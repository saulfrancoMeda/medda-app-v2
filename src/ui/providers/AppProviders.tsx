import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContainerProvider } from '@ui/providers/ContainerProvider';
import { AuthProvider } from '@ui/providers/AuthProvider';
import { RegistrationProvider } from '@ui/features/registration/RegistrationProvider';
import { SecurityMonitor } from '@ui/providers/SecurityMonitor';
import { LocationGate } from '@ui/providers/LocationGate';
import { ToastProvider } from '@ui/providers/ToastProvider';

const queryClient = new QueryClient();

/** Providers raíz: gestos, contenedor (DI), área segura, react-query (datos) y auth. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ContainerProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RegistrationProvider>
                  <SecurityMonitor>
                    <LocationGate>{children}</LocationGate>
                  </SecurityMonitor>
                </RegistrationProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </ContainerProvider>
    </GestureHandlerRootView>
  );
}
