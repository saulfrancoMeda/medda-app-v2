import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WalletError } from '@domain/wallet/ports/WalletRepository';
import { isValidAmount } from '@domain/wallet/entities/Transfer';
import { Button, Input, Text } from '@ui/design-system/components';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { useCategories, useDefaultAccount, useServices } from '@ui/features/wallet/hooks/useWallet';
import { useContainer } from '@ui/providers/ContainerProvider';
import type { StoreStackParamList } from '@ui/navigation/types';

const walletErrorMessage = (e: WalletError): string =>
  e.type === 'unauthorized'
    ? 'NIP incorrecto o sesión expirada'
    : e.type === 'network'
      ? 'Revisa tu conexión a internet'
      : e.message || 'No se pudo procesar el pago';

// Paso 1: categorías.
type CatProps = NativeStackScreenProps<StoreStackParamList, 'ServicePayments'>;
export function ServicePaymentsScreen({ navigation }: CatProps) {
  const categories = useCategories();
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Text variant="body" tone="muted">
        Elige el servicio que quieres pagar.
      </Text>
      {categories.isPending ? <ActivityIndicator /> : null}
      <View className="flex-row flex-wrap gap-md">
        {(categories.data ?? []).map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ServiceList', { categoryId: c.id, categoryName: c.name })}
            className="w-[30%] items-center gap-sm rounded-card border border-neutral-200 p-md dark:border-neutral-800"
          >
            <Ionicons name="flash-outline" size={26} color="#d7a300" />
            <Text variant="caption" center>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// Paso 2: operadores/servicios de la categoría.
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
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </Pressable>
      )}
    />
  );
}

// Paso 3: monto + referencia -> NIP -> procesa.
type PayProps = NativeStackScreenProps<StoreStackParamList, 'ServicePay'>;
export function ServicePayScreen({ route, navigation }: PayProps) {
  const { serviceId, serviceName } = route.params;
  const account = useDefaultAccount();
  const { walletRepository } = useContainer();
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);
  const valid = reference.trim().length > 0 && isValidAmount(amount) && Boolean(account.data);

  const authorize = async (nip: string) => {
    if (!account.data) return;
    setLoading(true);
    setNipError(undefined);
    const res = await walletRepository.payService({
      account: account.data.id,
      service: serviceId,
      amount: Number(amount).toFixed(2),
      reference: reference.trim(),
      nip,
    });
    setLoading(false);
    if (!res.ok) {
      setNipError(walletErrorMessage(res.error));
      return;
    }
    setNipVisible(false);
    Alert.alert('Pago exitoso', `Tu pago de ${serviceName} se procesó correctamente.`);
    navigation.popToTop();
  };

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <Text variant="h2">{serviceName}</Text>
      <Input
        label="Referencia / número de servicio"
        keyboardType="number-pad"
        value={reference}
        onChangeText={(t) => setReference(t.replace(/[^0-9]/g, ''))}
      />
      <Input
        label="Monto"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
        error={amount.length > 0 && !isValidAmount(amount) ? 'Monto inválido' : undefined}
      />
      <Button title="Pagar" full disabled={!valid} onPress={() => setNipVisible(true)} />
      <NipModal
        visible={nipVisible}
        loading={loading}
        error={nipError}
        onSubmit={authorize}
        onClose={() => setNipVisible(false)}
      />
    </ScrollView>
  );
}
