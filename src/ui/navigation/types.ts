import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  LoginPhone: undefined;
  LoginPassword: { phone: string; name: string };
};

// Tabs visibles + pantallas accesibles desde el drawer (ocultas de la barra) para que el
// bottom tab SIEMPRE permanezca visible al navegar a Perfil/Legales/Seguridad.
export type AppTabsParamList = {
  Store: undefined;
  Sales: undefined;
  Wallet: undefined;
  Faq: undefined;
  Profile: undefined;
  Legal: undefined;
  Security: undefined;
};

export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<AppTabsParamList>;
};
