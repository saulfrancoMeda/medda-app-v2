import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { WalletScreen } from '@ui/features/wallet/screens/WalletScreen';
import { CashInMethodsScreen, CashInSpeiScreen } from '@ui/features/wallet/screens/CashInScreens';
import {
  CashOutConfirmScreen,
  CashOutMethodsScreen,
  CashOutSpeiFormScreen,
  TransactionSuccessScreen,
} from '@ui/features/wallet/screens/CashOutScreens';
import type { WalletStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<WalletStackParamList>();

// Stack DENTRO del tab Billetera: las pantallas de Abonar/Enviar conservan el bottom tab visible.
export function WalletStackNavigator() {
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
      <Stack.Screen name="WalletHome" component={WalletScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CashInMethods" component={CashInMethodsScreen} options={{ title: 'Abonar dinero' }} />
      <Stack.Screen name="CashInSpei" component={CashInSpeiScreen} options={{ title: 'Transferencia SPEI' }} />
      <Stack.Screen name="CashOutMethods" component={CashOutMethodsScreen} options={{ title: 'Enviar dinero' }} />
      <Stack.Screen name="CashOutSpeiForm" component={CashOutSpeiFormScreen} options={{ title: 'SPEI a terceros' }} />
      <Stack.Screen name="CashOutConfirm" component={CashOutConfirmScreen} options={{ title: 'Confirmar envío' }} />
      <Stack.Screen
        name="TransactionSuccess"
        component={TransactionSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
