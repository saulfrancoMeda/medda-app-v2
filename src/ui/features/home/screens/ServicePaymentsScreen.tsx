import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui/design-system/components';
import { useCategories } from '@ui/features/wallet/hooks/useWallet';

// Pago de servicios — paso 1: categorías. El flujo completo (operador -> monto -> NIP) se
// implementa en una iteración siguiente; aquí ya se ven las categorías reales del backend.
export function ServicePaymentsScreen() {
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
            className="w-[30%] items-center gap-sm rounded-card border border-neutral-200 p-md dark:border-neutral-800"
          >
            <Ionicons name="flash-outline" size={26} color="#8428da" />
            <Text variant="caption" center>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
