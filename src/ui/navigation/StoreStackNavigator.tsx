import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { StoreScreen } from '@ui/features/home/screens/StoreScreen';
import { ServicePaymentsScreen } from '@ui/features/home/screens/ServicePaymentsScreen';
import type { StoreStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<StoreStackParamList>();

export function StoreStackNavigator() {
  const { colorScheme } = useColorScheme();
  const tint = colorScheme === 'dark' ? '#f9fafb' : '#0a0f14';
  const bg = colorScheme === 'dark' ? '#060612' : '#ffffff';
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: tint,
        headerTitleStyle: { color: tint },
        headerStyle: { backgroundColor: bg },
      }}
    >
      <Stack.Screen name="StoreHome" component={StoreScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ServicePayments"
        component={ServicePaymentsScreen}
        options={{ title: 'Pago de servicios' }}
      />
    </Stack.Navigator>
  );
}
