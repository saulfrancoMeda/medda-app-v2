import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { ChatScreen, FaqDetailScreen, FaqListScreen } from '@ui/features/support/screens/FaqScreens';
import type { FaqStackParamList } from '@ui/navigation/types';

const Stack = createNativeStackNavigator<FaqStackParamList>();

// Stack del tab Ayuda: lista (con AppHeader) + detalle (HTML) + chat (WebView), con back nativo.
export function FaqStackNavigator() {
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
      <Stack.Screen name="FaqList" component={FaqListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FaqDetail" component={FaqDetailScreen} options={{ title: 'Ayuda' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chatea con nosotros' }} />
    </Stack.Navigator>
  );
}
