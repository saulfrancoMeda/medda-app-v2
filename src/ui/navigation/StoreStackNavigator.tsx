import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StoreScreen } from '@ui/features/home/screens/StoreScreen';
import { MyQrScreen } from '@ui/features/home/screens/MyQrScreen';
import {
  ServiceListScreen,
  ServicePayScreen,
  ServicePaymentsScreen,
} from '@ui/features/home/screens/ServicePaymentsScreen';
import { useStackScreenOptions } from '@ui/navigation/headerOptions';
import type { StoreStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<StoreStackParamList>();

export function StoreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={useStackScreenOptions()}>
      <Stack.Screen name="StoreHome" component={StoreScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ServicePayments"
        component={ServicePaymentsScreen}
        options={{ title: 'Pago de servicios' }}
      />
      <Stack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <Stack.Screen
        name="ServicePay"
        component={ServicePayScreen}
        options={{ title: 'Realizar pago' }}
      />
      <Stack.Screen name="MyQr" component={MyQrScreen} options={{ title: 'Mi QR' }} />
    </Stack.Navigator>
  );
}
