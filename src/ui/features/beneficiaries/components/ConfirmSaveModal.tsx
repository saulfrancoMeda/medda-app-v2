import { Modal, Pressable, View } from 'react-native';
import { fullBeneficiaryName, type Beneficiary } from '@domain/beneficiaries/entities/Beneficiary';
import { Button, Text } from '@ui/design-system/components';

interface ConfirmSaveModalProps {
  readonly visible: boolean;
  readonly beneficiaries: readonly Beneficiary[];
  readonly loading: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function ConfirmSaveModal({
  visible,
  beneficiaries,
  loading,
  onConfirm,
  onClose,
}: ConfirmSaveModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={loading ? undefined : onClose} />
      <View
        className="gap-md bg-neutral-0 px-lg pb-10 pt-lg dark:bg-neutral-900"
        style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26 }}
      >
        <Text variant="h2">Confirma tus beneficiarios</Text>
        <Text variant="caption" tone="muted">
          Revisa que los datos sean correctos antes de guardar. Podrás editarlos cuando lo
          necesites.
        </Text>
        <View className="gap-sm">
          {beneficiaries.map((beneficiary, index) => (
            <View
              key={`${fullBeneficiaryName(beneficiary)}-${index}`}
              className="flex-row items-center justify-between rounded-md bg-neutral-100 px-md py-sm dark:bg-neutral-800"
            >
              <Text variant="body" className="flex-1 pr-md">
                {fullBeneficiaryName(beneficiary)}
              </Text>
              <Text variant="body" tone="brand" className="font-semibold">
                {beneficiary.percent}%
              </Text>
            </View>
          ))}
        </View>
        <Button title="Guardar beneficiarios" full loading={loading} onPress={onConfirm} />
        <Button
          title="Revisar de nuevo"
          variant="ghost"
          full
          disabled={loading}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}
