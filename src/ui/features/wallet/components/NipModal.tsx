import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@ui/design-system/components';
import { NIP_LENGTH, NipKeypad } from '@ui/features/wallet/components/NipKeypad';

interface NipModalProps {
  readonly visible: boolean;
  readonly loading?: boolean;
  readonly error?: string;
  readonly onSubmit: (nip: string) => void;
  readonly onClose: () => void;
}

// Mantiene el NIP en curso. Se remonta vía `key` al abrir el modal o al cambiar el error,
// reiniciando los dígitos sin efectos ni refs en render.
function NipEntry({
  loading,
  error,
  onSubmit,
}: Pick<NipModalProps, 'loading' | 'error' | 'onSubmit'>) {
  const [digits, setDigits] = useState('');
  return (
    <NipKeypad
      value={digits}
      onChange={setDigits}
      onComplete={onSubmit}
      loading={loading}
      error={error}
    />
  );
}

export function NipModal({ visible, loading = false, error, onSubmit, onClose }: NipModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={loading ? undefined : onClose}
        />
        <View
          className="gap-lg bg-neutral-0 px-lg pb-10 pt-md dark:bg-neutral-900"
          style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
        >
          <View className="items-center gap-md">
            <View className="h-1 w-10 rounded-pill bg-neutral-200 dark:bg-neutral-700" />
            <Text variant="h2" center>
              Por tu seguridad
            </Text>
            <Text variant="body" tone="muted" center>
              Ingresa tu NIP para autorizar
            </Text>
          </View>

          <NipEntry
            key={`${String(visible)}:${error ?? ''}`}
            loading={loading}
            error={error}
            onSubmit={onSubmit}
          />

          <Pressable onPress={loading ? undefined : onClose} className="items-center py-xs">
            <Text variant="body" tone="muted">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export { NIP_LENGTH };
