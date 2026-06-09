import { Pressable, ScrollView, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { isCredit, signedAmount } from '@domain/wallet/entities/Movement';
import { Text } from '@ui/design-system/components';
import { useToast } from '@ui/providers/ToastProvider';
import type { WalletStackParamList } from '@ui/navigation/types';

const formatDateTime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <View className="flex-row items-start justify-between gap-md border-b border-neutral-100 py-md dark:border-neutral-800">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="body" className={mono ? 'flex-1 text-right font-mono' : 'flex-1 text-right'}>
        {value}
      </Text>
    </View>
  );
}

type Props = NativeStackScreenProps<WalletStackParamList, 'MovementDetail'>;

export function MovementDetailScreen({ route }: Props) {
  const { movement } = route.params;
  const toast = useToast();
  const credit = isCredit(movement);
  const amount = Math.abs(movement.amount);
  const total = amount + (movement.commission ?? 0);

  const copyId = async () => {
    await Clipboard.setStringAsync(movement.id);
    toast.success('No. de transacción copiado.');
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="items-center gap-sm py-md">
        <View
          className={`h-16 w-16 items-center justify-center rounded-pill ${credit ? 'bg-success/15' : 'bg-brand-100'}`}
        >
          <Ionicons
            name={credit ? 'arrow-down' : 'arrow-up'}
            size={28}
            color={credit ? '#2E8C6A' : '#97720A'}
          />
        </View>
        <Text variant="display" className={credit ? 'text-success' : undefined}>
          {formatCurrency(signedAmount(movement))}
        </Text>
        <Text variant="body" tone="muted">
          {movement.description || 'Movimiento'}
        </Text>
      </View>

      <View className="rounded-card border border-neutral-200 px-lg dark:border-neutral-800">
        <DetailRow label="Tipo de movimiento" value={movement.description} />
        <DetailRow label="Proveedor" value={movement.provider} />
        <DetailRow label="Cuenta destino" value={movement.destinyAccount} mono />
        <DetailRow
          label={movement.referenceLabel ?? 'Referencia'}
          value={movement.reference}
          mono
        />
        <DetailRow label="Importe" value={formatCurrency(amount)} />
        {movement.commission !== undefined ? (
          <DetailRow label="Cargo por transacción" value={formatCurrency(movement.commission)} />
        ) : null}
        {movement.commission !== undefined ? (
          <DetailRow label="Total" value={formatCurrency(total)} />
        ) : null}
        <DetailRow label="Fecha y hora" value={formatDateTime(movement.date)} />
        <DetailRow label="Clave de rastreo" value={movement.claveRastreo} mono />
        <DetailRow label="Beneficiario" value={movement.beneficiaryName} />
        <DetailRow label="Correo del beneficiario" value={movement.beneficiaryEmail} />
        <DetailRow label="Concepto" value={movement.comments} />
        <DetailRow label="Estatus" value={movement.state} />
      </View>

      <Pressable
        onPress={copyId}
        accessibilityRole="button"
        className="flex-row items-center justify-center gap-sm py-sm"
      >
        <Ionicons name="copy-outline" size={18} color="#97720A" />
        <Text variant="body" tone="link" className="font-semibold">
          Copiar no. de transacción
        </Text>
      </Pressable>
    </ScrollView>
  );
}
