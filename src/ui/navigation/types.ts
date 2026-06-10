import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SpeiSendInput, TransactionResult } from '@domain/wallet/entities/Transfer';
import type { Movement } from '@domain/wallet/entities/Movement';
import type { FaqItem } from '@domain/support/entities/Faq';
import type { Beneficiary } from '@domain/beneficiaries/entities/Beneficiary';

export type AuthStackParamList = {
  LoginPhone: undefined;
  LoginPassword: { phone: string; name: string };
  RecoverPhone: undefined;
  RecoverCode: { phone: string };
  RecoverNewPassword: { phone: string; code: string };
  Unlock: undefined;
  RegisterPhone: undefined;
  RegisterOtp: undefined;
  RegisterPersonal: undefined;
  RegisterDemographics: undefined;
  RegisterDocument: undefined;
  RegisterAddress: undefined;
  RegisterBeneficiaries: undefined;
  RegisterSurvey: undefined;
  RegisterNip: undefined;
  RegisterLegal: undefined;
};

export type SpeiDraft = Omit<SpeiSendInput, 'nip' | 'location'>;

export type WalletStackParamList = {
  WalletHome: undefined;
  CashInMethods: undefined;
  CashInSpei: undefined;
  CashOutMethods: undefined;
  CashOutSpeiForm: undefined;
  CashOutConfirm: { draft: SpeiDraft };
  TransactionSuccess: { result: TransactionResult; draft: SpeiDraft };
  CashOutMedaScan: undefined;
  CashOutMedaAmount: { resource: string };
  MovementDetail: { movement: Movement };
};

export type AppTabsParamList = {
  Store: undefined;
  Sales: undefined;
  Wallet: NavigatorScreenParams<WalletStackParamList>;
  Faq: undefined;
  Sections: NavigatorScreenParams<SectionsStackParamList>;
};

export type StoreStackParamList = {
  StoreHome: undefined;
  ServicePayments: undefined;
  ServiceList: { categoryId: string; categoryName: string };
  ServicePay: { serviceId: string; serviceName: string };
  MyQr: undefined;
};

export type FaqStackParamList = {
  FaqList: undefined;
  FaqDetail: { item: FaqItem };
  Chat: undefined;
  Clarifications: undefined;
};

export type SectionsStackParamList = {
  Profile: undefined;
  Notifications: undefined;
  Legal: undefined;
  PdfViewer: { title: string; url: string; web?: boolean };
  Statements: undefined;
  Beneficiaries: undefined;
  BeneficiariesEdit: { initial?: Beneficiary[] } | undefined;
  Security: undefined;
  ChangePassword: undefined;
  ChangeNip: undefined;
  ChangeEmail: undefined;
  ChangeNumber: undefined;
  SetNip: undefined;
  ValidateEmail: { email?: string };
  CancelAccount: undefined;
};

export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<AppTabsParamList>;
};
