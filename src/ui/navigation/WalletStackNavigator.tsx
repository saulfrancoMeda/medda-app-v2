import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WalletScreen } from '@ui/features/wallet/screens/WalletScreen';
import { CashInMethodsScreen, CashInSpeiScreen } from '@ui/features/wallet/screens/CashInScreens';
import {
  CashOutConfirmScreen,
  CashOutMedaAmountScreen,
  CashOutMedaScanScreen,
  CashOutMethodsScreen,
  CashOutNipScreen,
  CashOutSpeiAmountScreen,
  CashOutSpeiRecipientScreen,
  TransactionSuccessScreen,
} from '@ui/features/wallet/screens/CashOutScreens';
import { MovementDetailScreen } from '@ui/features/wallet/screens/MovementDetailScreen';
import { useStackScreenOptions } from '@ui/navigation/headerOptions';
import type { WalletStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStackNavigator() {
  return (
    <Stack.Navigator screenOptions={useStackScreenOptions()}>
      <Stack.Screen name="WalletHome" component={WalletScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} options={{ title: 'Detalle del movimiento' }} />
      <Stack.Screen name="CashInMethods" component={CashInMethodsScreen} options={{ title: 'Abonar dinero' }} />
      <Stack.Screen name="CashInSpei" component={CashInSpeiScreen} options={{ title: 'Transferencia SPEI' }} />
      <Stack.Screen name="CashOutMethods" component={CashOutMethodsScreen} options={{ title: 'Enviar dinero' }} />
      <Stack.Screen name="CashOutSpeiRecipient" component={CashOutSpeiRecipientScreen} options={{ title: 'Datos del destinatario' }} />
      <Stack.Screen name="CashOutSpeiAmount" component={CashOutSpeiAmountScreen} options={{ title: 'Monto a enviar' }} />
      <Stack.Screen name="CashOutConfirm" component={CashOutConfirmScreen} options={{ title: 'Confirmar envío' }} />
      <Stack.Screen name="CashOutNip" component={CashOutNipScreen} options={{ title: 'Autorizar envío', gestureEnabled: false }} />
      <Stack.Screen name="CashOutMedaScan" component={CashOutMedaScanScreen} options={{ title: 'Escanear QR' }} />
      <Stack.Screen name="CashOutMedaAmount" component={CashOutMedaAmountScreen} options={{ title: 'Enviar a usuario Medá' }} />
      <Stack.Screen
        name="TransactionSuccess"
        component={TransactionSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
