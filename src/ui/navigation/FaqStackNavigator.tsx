import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ChatScreen,
  ClarificationsScreen,
  FaqDetailScreen,
  FaqListScreen,
} from '@ui/features/support/screens/FaqScreens';
import { useStackScreenOptions } from '@ui/navigation/headerOptions';
import type { FaqStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<FaqStackParamList>();

// Stack del tab Ayuda: lista (con AppHeader) + detalle (HTML) + chat (WebView), con back nativo.
export function FaqStackNavigator() {
  return (
    <Stack.Navigator screenOptions={useStackScreenOptions()}>
      <Stack.Screen name="FaqList" component={FaqListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FaqDetail" component={FaqDetailScreen} options={{ title: 'Ayuda' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chatea con nosotros' }} />
      <Stack.Screen
        name="Clarifications"
        component={ClarificationsScreen}
        options={{ title: 'Historial de aclaraciones' }}
      />
    </Stack.Navigator>
  );
}
