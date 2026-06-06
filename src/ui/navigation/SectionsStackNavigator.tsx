import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { ProfileScreen } from '@ui/features/account/screens/AccountScreens';
import { LegalScreen, StatementsScreen } from '@ui/features/account/screens/LegalScreens';
import {
  ChangeNipScreen,
  ChangePasswordScreen,
  SecurityScreen,
} from '@ui/features/account/screens/SecurityScreens';
import type { SectionsStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<SectionsStackParamList>();

// Stack de las secciones del drawer (Perfil/Legales/Seguridad y subpantallas). Es un tab oculto,
// así que el bottom tab permanece visible y las subpantallas tienen push/back nativo.
export function SectionsStackNavigator() {
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
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi perfil' }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ title: 'Legales y Estado de cuenta' }} />
      <Stack.Screen name="Statements" component={StatementsScreen} options={{ title: 'Estado de cuenta' }} />
      <Stack.Screen name="Security" component={SecurityScreen} options={{ title: 'Seguridad' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
      <Stack.Screen name="ChangeNip" component={ChangeNipScreen} options={{ title: 'Cambiar NIP' }} />
    </Stack.Navigator>
  );
}
