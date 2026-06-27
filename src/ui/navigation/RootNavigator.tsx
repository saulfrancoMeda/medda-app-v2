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
import { UnlockScreen } from '@ui/features/auth/screens/UnlockScreen';
import {
  RegisterAddressScreen,
  RegisterBeneficiariesScreen,
  RegisterDemographicsScreen,
  RegisterDocumentScreen,
  RegisterLegalScreen,
  RegisterNipScreen,
  RegisterOtpScreen,
  RegisterPersonalScreen,
  RegisterPhoneScreen,
  RegisterSurveyScreen,
} from '@ui/features/auth/screens/RegisterScreens';
import { LoadingScreen } from '@ui/features/common/LoadingScreen';
import { AppNavigator } from '@ui/navigation/AppNavigator';
import { useStackScreenOptions } from '@ui/navigation/headerOptions';
import type { AuthStackParamList } from '@ui/navigation/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ ...useStackScreenOptions({ showBell: false }), headerShown: false }}>
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
      <AuthStack.Screen
        name="Unlock"
        component={UnlockScreen}
        options={{ headerShown: true, title: 'Desbloquear usuario' }}
      />
      <AuthStack.Screen
        name="RegisterPhone"
        component={RegisterPhoneScreen}
        options={{ headerShown: true, title: 'Crear cuenta' }}
      />
      <AuthStack.Screen
        name="RegisterOtp"
        component={RegisterOtpScreen}
        options={{ headerShown: true, title: 'Verifica tu número' }}
      />
      <AuthStack.Screen
        name="RegisterPersonal"
        component={RegisterPersonalScreen}
        options={{ headerShown: true, title: 'Tus datos' }}
      />
      <AuthStack.Screen
        name="RegisterDemographics"
        component={RegisterDemographicsScreen}
        options={{ headerShown: true, title: 'Cuéntanos de ti' }}
      />
      <AuthStack.Screen
        name="RegisterDocument"
        component={RegisterDocumentScreen}
        options={{ headerShown: true, title: 'Tu identificación' }}
      />
      <AuthStack.Screen
        name="RegisterAddress"
        component={RegisterAddressScreen}
        options={{ headerShown: true, title: 'Tu domicilio' }}
      />
      <AuthStack.Screen
        name="RegisterBeneficiaries"
        component={RegisterBeneficiariesScreen}
        options={{ headerShown: true, title: 'Beneficiarios' }}
      />
      <AuthStack.Screen
        name="RegisterSurvey"
        component={RegisterSurveyScreen}
        options={{ headerShown: true, title: 'Unas preguntas' }}
      />
      <AuthStack.Screen
        name="RegisterNip"
        component={RegisterNipScreen}
        options={{ headerShown: true, title: 'Crea tu NIP' }}
      />
      <AuthStack.Screen
        name="RegisterLegal"
        component={RegisterLegalScreen}
        options={{ headerShown: true, title: 'Términos' }}
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
      background: colorScheme === 'dark' ? '#131110' : '#ffffff',
      card: colorScheme === 'dark' ? '#131110' : '#ffffff',
      primary: '#fcd535',
    },
  };

  if (status === 'loading') {
    return <LoadingScreen message="Cargando tu cuenta…" />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {status === 'signedIn' ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
