import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@ui/features/account/screens/AccountScreens';
import {
  LegalScreen,
  PdfViewerScreen,
  StatementsScreen,
} from '@ui/features/account/screens/LegalScreens';
import { BeneficiariesScreen } from '@ui/features/beneficiaries/screens/BeneficiariesScreen';
import { BeneficiariesEditScreen } from '@ui/features/beneficiaries/screens/BeneficiariesEditScreen';
import {
  ChangeEmailScreen,
  ChangeNipScreen,
  ChangeNumberScreen,
  ChangePasswordScreen,
  SecurityScreen,
  SetNipScreen,
  ValidateEmailScreen,
} from '@ui/features/account/screens/SecurityScreens';
import { CancelAccountScreen } from '@ui/features/account/screens/CancelAccountScreens';
import { NotificationsScreen } from '@ui/features/notifications/screens/NotificationsScreen';
import { useStackScreenOptions } from '@ui/navigation/headerOptions';
import type { SectionsStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<SectionsStackParamList>();

// Stack de las secciones del drawer (Perfil/Legales/Seguridad y subpantallas). Es un tab oculto,
// así que el bottom tab permanece visible y las subpantallas tienen push/back nativo.
export function SectionsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={useStackScreenOptions()}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi perfil' }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notificaciones' }}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{ title: 'Legales y Estado de cuenta' }}
      />
      <Stack.Screen
        name="PdfViewer"
        component={PdfViewerScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <Stack.Screen
        name="Statements"
        component={StatementsScreen}
        options={{ title: 'Estado de cuenta' }}
      />
      <Stack.Screen
        name="Beneficiaries"
        component={BeneficiariesScreen}
        options={{ title: 'Mis beneficiarios' }}
      />
      <Stack.Screen
        name="BeneficiariesEdit"
        component={BeneficiariesEditScreen}
        options={{ title: 'Editar beneficiarios' }}
      />
      <Stack.Screen name="Security" component={SecurityScreen} options={{ title: 'Seguridad' }} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Cambiar contraseña' }}
      />
      <Stack.Screen
        name="ChangeNip"
        component={ChangeNipScreen}
        options={{ title: 'Cambiar NIP' }}
      />
      <Stack.Screen
        name="ChangeEmail"
        component={ChangeEmailScreen}
        options={{ title: 'Cambiar correo' }}
      />
      <Stack.Screen
        name="ChangeNumber"
        component={ChangeNumberScreen}
        options={{ title: 'Cambiar número' }}
      />
      <Stack.Screen name="SetNip" component={SetNipScreen} options={{ title: 'Establecer NIP' }} />
      <Stack.Screen
        name="ValidateEmail"
        component={ValidateEmailScreen}
        options={{ title: 'Validar correo' }}
      />
      <Stack.Screen
        name="CancelAccount"
        component={CancelAccountScreen}
        options={{ title: 'Cancelar cuenta' }}
      />
    </Stack.Navigator>
  );
}
