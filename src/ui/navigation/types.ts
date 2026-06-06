import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SpeiSendInput, TransactionResult } from '@domain/wallet/entities/Transfer';
import type { FaqItem } from '@domain/support/entities/Faq';

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

// Tabs visibles + un tab oculto "Sections" (stack) con las pantallas del drawer, para que el
// bottom tab SIEMPRE permanezca visible y las subpantallas tengan push/back nativo.
export type AppTabsParamList = {
  Store: undefined;
  Sales: undefined;
  Wallet: undefined;
  Faq: undefined;
  Sections: NavigatorScreenParams<SectionsStackParamList>;
};

export type FaqStackParamList = {
  FaqList: undefined;
  FaqDetail: { item: FaqItem };
  Chat: undefined;
};

export type SectionsStackParamList = {
  Profile: undefined;
  Legal: undefined;
  Statements: undefined;
  Security: undefined;
  ChangePassword: undefined;
  ChangeNip: undefined;
};

export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<AppTabsParamList>;
};
