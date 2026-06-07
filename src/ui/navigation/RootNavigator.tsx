import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@ui/providers/AuthProvider';
import { LoginPhoneScreen } from '@ui/features/auth/screens/LoginPhoneScreen';
import { LoginPasswordScreen } from '@ui/features/auth/screens/LoginPasswordScreen';
import {
  RecoverCodeScreen,
  RecoverNewPasswordScreen,
  RecoverPhoneScreen,
} from '@ui/features/auth/screens/RecoverScreens';
import { AppNavigator } from '@ui/navigation/AppNavigator';
import type { AuthStackParamList } from '@ui/navigation/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginPhone" component={LoginPhoneScreen} />
      <AuthStack.Screen name="LoginPassword" component={LoginPasswordScreen} />
      <AuthStack.Screen
        name="RecoverPhone"
        component={RecoverPhoneScreen}
        options={{ headerShown: true, title: 'Recuperar contraseña' }}
      />
      <AuthStack.Screen
        name="RecoverCode"
        component={RecoverCodeScreen}
        options={{ headerShown: true, title: 'Código' }}
      />
      <AuthStack.Screen
        name="RecoverNewPassword"
        component={RecoverNewPasswordScreen}
        options={{ headerShown: true, title: 'Nueva contraseña' }}
      />
    </AuthStack.Navigator>
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

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator color="#fcd535" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {status === 'signedIn' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
