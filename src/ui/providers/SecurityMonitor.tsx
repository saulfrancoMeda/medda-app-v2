import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';

/**
 * Protecciones de seguridad (normativas fintech), paridad con el legacy:
 *  1. Cambio de red (wifi <-> datos) estando logueado -> expira la sesión.
 *  2. Geolocalización desactivada estando logueado -> expira la sesión.
 *  3. Sin conexión -> banner "Se perdió la conexión".
 * Al expirar, cierra sesión y muestra el modal "Tu sesión expiró".
 */
export function SecurityMonitor({ children }: { children: ReactNode }) {
  const { status, signOut } = useAuth();
  const [offline, setOffline] = useState(false);
  const [expired, setExpired] = useState(false);

  const signedIn = useRef(false);
  const lastNetType = useRef<string | null>(null);

  useEffect(() => {
    signedIn.current = status === 'signedIn';
    if (status === 'signedIn') {
      // Reinicia la línea base al (re)iniciar sesión para no expirar de inmediato.
      lastNetType.current = null;
    }
  }, [status]);

  const expire = useCallback(() => {
    if (!signedIn.current) return;
    setExpired(true);
    void signOut();
  }, [signOut]);

  // Conectividad y tipo de red (cambio wifi<->datos -> expira; sin conexión -> banner).
  // (La ubicación obligatoria se maneja en LocationGate.)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(state.isConnected === false);
      const type = state.type;
      if (state.isConnected && (type === 'wifi' || type === 'cellular')) {
        if (signedIn.current && lastNetType.current && lastNetType.current !== type) {
          expire();
        }
        lastNetType.current = type;
      }
    });
    return unsubscribe;
  }, [expire]);

  return (
    <View className="flex-1">
      {children}

      {offline ? (
        <SafeAreaView edges={['bottom']} className="absolute inset-x-0 bottom-0">
          <View className="m-md flex-row items-center gap-sm rounded-card bg-danger/10 p-md">
            <Ionicons name="warning-outline" size={20} color="#ef4444" />
            <Text variant="body" tone="danger">
              Se perdió la conexión
            </Text>
          </View>
        </SafeAreaView>
      ) : null}

      <Modal visible={expired} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-lg">
          <View className="w-full items-center gap-md rounded-xl bg-neutral-0 p-xl dark:bg-neutral-900">
            <View className="h-20 w-20 items-center justify-center rounded-pill bg-brand-500">
              <Ionicons name="lock-closed" size={36} color="#0a0f14" />
            </View>
            <Text variant="h2" center>
              Tu sesión expiró
            </Text>
            <Text variant="body" tone="muted" center>
              Se cerró tu sesión automáticamente por seguridad. Inicia sesión de nuevo para
              continuar.
            </Text>
            <Button title="Iniciar sesión" full onPress={() => setExpired(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
