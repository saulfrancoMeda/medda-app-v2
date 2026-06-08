import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';

const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

export function SecurityMonitor({ children }: { children: ReactNode }) {
  const { status, signOut } = useAuth();
  const [offline, setOffline] = useState(false);
  const [expired, setExpired] = useState(false);

  const signedIn = useRef(false);
  const lastNetType = useRef<string | null>(null);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    signedIn.current = status === 'signedIn';
    if (status === 'signedIn') {
      lastNetType.current = null;
      backgroundedAt.current = null;
    }
  }, [status]);

  const expire = useCallback(() => {
    if (!signedIn.current) return;
    setExpired(true);
    void signOut();
  }, [signOut]);

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

  useEffect(() => {
    if (status !== 'signedIn') return;

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAt.current = Date.now();
      } else if (nextState === 'active' && backgroundedAt.current !== null) {
        if (Date.now() - backgroundedAt.current >= SESSION_TIMEOUT_MS) {
          expire();
        }
        backgroundedAt.current = null;
      }
    });

    const timer = setTimeout(expire, SESSION_TIMEOUT_MS);

    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [status, expire]);

  return (
    <View className="flex-1">
      {children}

      {offline ? (
        <SafeAreaView edges={['bottom']} className="absolute inset-x-0 bottom-0">
          <View className="m-md flex-row items-center gap-sm rounded-card bg-danger/10 p-md">
            <Ionicons name="warning-outline" size={20} color="#C24A30" />
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
              <Ionicons name="lock-closed" size={36} color="#1B1812" />
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
