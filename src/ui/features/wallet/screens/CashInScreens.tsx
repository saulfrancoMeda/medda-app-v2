import { ActivityIndicator, Pressable, ScrollView, Share, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { Text } from '@ui/design-system/components';
import {
  useBalance,
  useDefaultAccount,
  useStpAccount,
} from '@ui/features/wallet/hooks/useWallet';
import { MethodRow } from '@ui/features/wallet/components/MethodRow';
import { useToast } from '@ui/providers/ToastProvider';
import type { WalletStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

type MethodsProps = NativeStackScreenProps<WalletStackParamList, 'CashInMethods'>;

export function CashInMethodsScreen({ navigation }: MethodsProps) {
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <Text variant="body" tone="muted">
        Elige cómo quieres abonar dinero a tu billetera.
      </Text>
      <MethodRow
        icon="swap-horizontal"
        title="Transferencia SPEI"
        subtitle="Recibe dinero desde cualquier banco a tu CLABE"
        variant="card"
        onPress={() => navigation.navigate('CashInSpei')}
      />
    </ScrollView>
  );
}

export function CashInSpeiScreen() {
  const stp = useStpAccount();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const toast = useToast();
  const clabe = stp.data?.clabe ?? '';

  const onCopy = async () => {
    if (!clabe) return;
    await Clipboard.setStringAsync(clabe);
    toast.success('CLABE copiada al portapapeles.');
  };

  const onShare = async () => {
    if (!clabe) return;
    await Share.share({
      message: `Mi CLABE Medá para recibir transferencias SPEI:\n${clabe}\n\nBanco: STP — Sistema de Transferencias y Pagos`,
    });
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      {/* Saldo actual */}
      <View className="flex-row items-center justify-between rounded-card bg-neutral-50 px-lg py-md dark:bg-neutral-900">
        <Text variant="caption" tone="muted">Saldo disponible</Text>
        {balance.isPending ? (
          <ActivityIndicator size="small" color={palette.neutral[400]} />
        ) : (
          <Text variant="body" className="font-semibold" style={{ fontVariant: ['tabular-nums'] }}>
            {balance.data !== undefined ? formatCurrency(balance.data) : '—'}
          </Text>
        )}
      </View>

      <Text variant="body" tone="muted">
        Transfiere por SPEI a la siguiente CLABE desde tu banco. Tu saldo se verá reflejado en
        menos de 2 horas.
      </Text>

      {/* Tarjeta CLABE */}
      <View className="gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
        <View>
          <Text variant="caption" tone="muted">Banco</Text>
          <Text variant="body">STP — Sistema de Transferencias y Pagos</Text>
        </View>
        <View>
          <Text variant="caption" tone="muted">CLABE Medá</Text>
          <Text variant="h2" style={{ fontVariant: ['tabular-nums'] }}>{clabe || '—'}</Text>
        </View>
        <View className="flex-row gap-sm pt-sm">
          <Pressable
            onPress={onCopy}
            disabled={!clabe}
            accessibilityRole="button"
            accessibilityLabel="Copiar CLABE"
            className="flex-1 flex-row items-center justify-center gap-xs rounded-lg bg-brand-100 py-md active:opacity-70"
          >
            <Ionicons name="copy-outline" size={18} color={palette.brand[700]} />
            <Text variant="body" className="font-semibold text-brand-700">Copiar</Text>
          </Pressable>
          <Pressable
            onPress={onShare}
            disabled={!clabe}
            accessibilityRole="button"
            accessibilityLabel="Compartir CLABE"
            className="flex-1 flex-row items-center justify-center gap-xs rounded-lg border border-neutral-200 py-md active:opacity-70 dark:border-neutral-700"
          >
            <Ionicons name="share-outline" size={18} color={palette.neutral[500]} />
            <Text variant="body" className="font-semibold">Compartir</Text>
          </Pressable>
        </View>
      </View>

      <Text variant="caption" tone="muted">
        Verifica que la CLABE sea correcta antes de transferir. Solo se aceptan depósitos desde
        cuentas a tu nombre.
      </Text>
    </ScrollView>
  );
}
