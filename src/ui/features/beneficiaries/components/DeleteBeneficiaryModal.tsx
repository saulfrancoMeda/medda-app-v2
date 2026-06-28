import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from '@ui/design-system/components';
import { palette } from '@ui/design-system/tokens/palette';

interface DeleteBeneficiaryModalProps {
  readonly visible: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly loading: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function DeleteBeneficiaryModal({
  visible,
  title,
  message,
  confirmLabel,
  loading,
  onConfirm,
  onClose,
}: DeleteBeneficiaryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={loading ? undefined : onClose} />
      <View
        accessibilityViewIsModal
        className="gap-md bg-neutral-0 px-lg pb-10 pt-lg dark:bg-neutral-900"
        style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
      >
        <Text variant="h2">{title}</Text>
        <View className="flex-row items-start gap-sm rounded-md bg-danger/10 p-md">
          <Ionicons name="warning-outline" size={20} color={palette.danger} />
          <Text variant="caption" tone="danger" className="flex-1">
            {message}
          </Text>
        </View>
        <Button title={confirmLabel} full loading={loading} onPress={onConfirm} />
        <Button title="Cancelar" variant="ghost" full disabled={loading} onPress={onClose} />
      </View>
    </Modal>
  );
}
