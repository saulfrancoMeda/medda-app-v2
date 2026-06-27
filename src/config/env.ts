export interface AppConfig {
  readonly apiBaseUrl: string;
  readonly apiAltUrl: string;
  readonly oauthClientId: string;
  readonly oauthClientSecret: string;
  readonly cognito: {
    readonly region: string;
    readonly userPoolId: string;
    readonly clientId: string;
  };
  readonly appVersion: string;
  readonly xAuthToken: string;
  readonly chatUri: string;
  readonly supportPhone: string;
  readonly walletProvider: string;
  readonly legal: {
    readonly privacyAdvice: string;
    readonly termsAndConditions: string;
    readonly commissions: string;
    readonly adhesionContract: string;
  };
}

export const config: AppConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  apiAltUrl: process.env.EXPO_PUBLIC_API_ALT_URL ?? '',
  oauthClientId: process.env.EXPO_PUBLIC_OAUTH_CLIENT_ID ?? '',
  oauthClientSecret: process.env.EXPO_PUBLIC_OAUTH_CLIENT_SECRET ?? '',
  cognito: {
    region: process.env.EXPO_PUBLIC_COGNITO_REGION ?? '',
    userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '',
  },
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? '0.0.1',
  xAuthToken: process.env.EXPO_PUBLIC_X_AUTH_TOKEN ?? 'asdf46asdg16f7h0y',
  chatUri: process.env.EXPO_PUBLIC_CHAT_URI ?? '',
  supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE ?? '',
  walletProvider: process.env.EXPO_PUBLIC_WALLET_PROVIDER ?? 'meda',
  legal: {
    privacyAdvice: process.env.EXPO_PUBLIC_LEGAL_PRIVACY ?? '',
    termsAndConditions: process.env.EXPO_PUBLIC_LEGAL_TERMS ?? '',
    commissions: process.env.EXPO_PUBLIC_LEGAL_COMMISSIONS ?? '',
    adhesionContract: process.env.EXPO_PUBLIC_LEGAL_CONTRACT ?? '',
  },
};

export const isBackendConfigured = (): boolean =>
  config.apiBaseUrl !== '' &&
  config.cognito.userPoolId !== '' &&
  config.cognito.clientId !== '';
