import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isValidAmount } from '@domain/wallet/entities/Transfer';
import { Button, Input, Text } from '@ui/design-system/components';
import { walletErrorMessage } from '@ui/features/wallet/errorMessages';
import { useNipAuthorization } from '@ui/features/common/useNipAuthorization';
import { MoneyInput } from '@ui/features/wallet/components/MoneyInput';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import {
  useCategories,
  useDefaultAccount,
  useInvalidateWallet,
  useServices,
} from '@ui/features/wallet/hooks/useWallet';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useToast } from '@ui/providers/ToastProvider';
import type { StoreStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

type CatProps = NativeStackScreenProps<StoreStackParamList, 'ServicePayments'>;
export function ServicePaymentsScreen({ navigation }: CatProps) {
  const categories = useCategories();
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="gap-xs">
        <Text variant="h1">Pago de servicios</Text>
        <Text variant="body" tone="muted">
          Elige uno de los servicios que deseas pagar.
        </Text>
      </View>
      {categories.isPending ? <ActivityIndicator color={palette.brand[500]} /> : null}
      {categories.isError ? (
        <Text tone="muted">No se pudieron cargar las categorías.</Text>
      ) : null}
      <View className="flex-row flex-wrap gap-md">
        {(categories.data ?? []).map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ServiceList', { categoryId: c.id, categoryName: c.name })}
            className="w-[30%] items-center gap-sm rounded-card border border-neutral-200 bg-neutral-50 p-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-pill"
              style={{ backgroundColor: (c.color ?? palette.brand[700]) + '22' }}
            >
              <Ionicons name="flash-outline" size={24} color={c.color ?? palette.brand[700]} />
            </View>
            <Text variant="caption" center numberOfLines={2}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

type ListProps = NativeStackScreenProps<StoreStackParamList, 'ServiceList'>;
export function ServiceListScreen({ route, navigation }: ListProps) {
  const { categoryId } = route.params;
  const services = useServices(categoryId);
  return (
    <FlatList
      className="flex-1 bg-neutral-0 dark:bg-neutral-950"
      data={services.data ?? []}
      keyExtractor={(s) => s.id}
      contentContainerClassName="p-lg gap-md"
      ListHeaderComponent={
        <Text variant="body" tone="muted" className="pb-sm">
          Elige el operador del servicio que deseas pagar.
        </Text>
      }
      ListEmptyComponent={
        services.isPending ? (
          <ActivityIndicator />
        ) : (
          <Text tone="muted">
            {services.isError ? 'No se pudieron cargar los servicios.' : 'Sin servicios.'}
          </Text>
        )
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ServicePay', { serviceId: item.id, serviceName: item.name })}
          className="flex-row items-center justify-between rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
        >
          <Text variant="body" className="flex-1">
            {item.name}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={palette.neutral[400]} />
        </Pressable>
      )}
    />
  );
}

type PayProps = NativeStackScreenProps<StoreStackParamList, 'ServicePay'>;
export function ServicePayScreen({ route, navigation }: PayProps) {
  const { serviceId, serviceName } = route.params;
  const account = useDefaultAccount();
  const { walletRepository } = useContainer();
  const toast = useToast();
  const nipAuth = useNipAuthorization(walletErrorMessage);
  const invalidateWallet = useInvalidateWallet();
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const valid = reference.trim().length > 0 && isValidAmount(amount) && Boolean(account.data);

  const authorize = (nip: string) => {
    if (!account.data) return;
    void nipAuth.submit(
      () =>
        walletRepository.payService({
          account: account.data!.id,
          service: serviceId,
          amount: Number(amount).toFixed(2),
          reference: reference.trim(),
          nip,
        }),
      () => {
        invalidateWallet();
        toast.success(`Tu pago de ${serviceName} se procesó correctamente.`);
        navigation.popToTop();
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="gap-xs rounded-card bg-brand-500 p-lg">
        <Text className="text-ink">Pago de</Text>
        <Text variant="h2" className="text-ink">
          {serviceName}
        </Text>
      </View>
      <Input
        label="Referencia / número de servicio"
        leftIcon="barcode-outline"
        placeholder="Número de referencia"
        keyboardType="number-pad"
        value={reference}
        onChangeText={(t) => setReference(t.replace(/[^0-9]/g, ''))}
      />
      <MoneyInput label="Monto a pagar" value={amount} onChangeValue={setAmount} />
      <Text variant="caption" tone="muted">
        Al continuar, autoriza el pago con tu NIP.
      </Text>
      <Button title="Pagar" full disabled={!valid} onPress={nipAuth.open} />
      <NipModal
        visible={nipAuth.visible}
        loading={nipAuth.loading}
        error={nipAuth.nipError}
        onSubmit={authorize}
        onClose={nipAuth.close}
      />
    </ScrollView>
  );
}
