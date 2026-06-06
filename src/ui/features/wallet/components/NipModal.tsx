import { useState } from 'react';
import { Modal, View } from 'react-native';
import { isValidNip } from '@domain/wallet/entities/Transfer';
import { Button, Input, Text } from '@ui/design-system/components';

interface NipModalProps {
  readonly visible: boolean;
  readonly loading?: boolean;
  readonly error?: string;
  readonly onSubmit: (nip: string) => void;
  readonly onClose: () => void;
}

// Modal de NIP (6 dígitos) para autorizar transacciones. Paridad con WalletComponentCommonNipRequest.
export function NipModal({ visible, loading = false, error, onSubmit, onClose }: NipModalProps) {
  const [nip, setNip] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="gap-md rounded-t-xl bg-neutral-0 p-lg dark:bg-neutral-900">
          <Text variant="h2">Por tu seguridad</Text>
          <Text variant="body" tone="muted">
            Ingresa tu NIP para autorizar esta transacción
          </Text>
          <Input
            placeholder="••••••"
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
            value={nip}
            onChangeText={(t) => setNip(t.replace(/[^0-9]/g, ''))}
            error={error}
          />
          <Button
            title="Autorizar"
            full
            loading={loading}
            disabled={!isValidNip(nip)}
            onPress={() => onSubmit(nip)}
          />
          <Button title="Cancelar" variant="ghost" full disabled={loading} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
