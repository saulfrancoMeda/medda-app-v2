import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components';
import { cn } from '@ui/lib/cn';

type ToastType = 'success' | 'error';
interface ToastState {
  readonly message: string;
  readonly type: ToastType;
}
interface ToastApi {
  readonly success: (message: string) => void;
  readonly error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Notificaciones de éxito/error (banner superior, autodescarta a los 4s). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => show(m, 'success'), error: (m) => show(m, 'error') }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0" pointerEvents="none">
          <View
            className={cn(
              'm-md flex-row items-center gap-sm rounded-card p-md',
              toast.type === 'success' ? 'bg-success' : 'bg-danger',
            )}
          >
            <Ionicons
              name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={22}
              color="#ffffff"
            />
            <Text variant="body" className="flex-1 text-neutral-0">
              {toast.message}
            </Text>
          </View>
        </SafeAreaView>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}
