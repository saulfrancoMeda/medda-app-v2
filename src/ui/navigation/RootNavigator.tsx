import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@ui/providers/AuthProvider';
import { LoginPhoneScreen } from '@ui/features/auth/screens/LoginPhoneScreen';
import { LoginPasswordScreen } from '@ui/features/auth/screens/LoginPasswordScreen';
import { HomeScreen } from '@ui/features/home/screens/HomeScreen';
import type { AppStackParamList, AuthStackParamList } from '@ui/navigation/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginPhone" component={LoginPhoneScreen} />
      <AuthStack.Screen name="LoginPassword" component={LoginPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { status } = useAuth();
  const { colorScheme } = useColorScheme();
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colorScheme === 'dark' ? '#060612' : '#ffffff',
      card: colorScheme === 'dark' ? '#060612' : '#ffffff',
      primary: '#fcd535',
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {status === 'signedIn' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
