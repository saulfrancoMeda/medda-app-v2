import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SpeiSendInput, TransactionResult } from '@domain/wallet/entities/Transfer';

export type AuthStackParamList = {
  LoginPhone: undefined;
  LoginPassword: { phone: string; name: string };
};

// Datos del SPEI recolectados antes de confirmar (sin nip ni location, que se agregan al enviar).
export type SpeiDraft = Omit<SpeiSendInput, 'nip' | 'location'>;

export type WalletStackParamList = {
  WalletHome: undefined;
  CashInMethods: undefined;
  CashInSpei: undefined;
  CashOutMethods: undefined;
  CashOutSpeiForm: undefined;
  CashOutConfirm: { draft: SpeiDraft };
  TransactionSuccess: { result: TransactionResult; draft: SpeiDraft };
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
