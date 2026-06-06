/**
 * Configuración por entorno. Los valores vienen de variables EXPO_PUBLIC_* (en `.env` local o
 * en EAS por perfil). NUNCA se commitean secretos: ver `.env.example`.
 *
 * IMPORTANTE: hay que referenciar `process.env.EXPO_PUBLIC_*` de forma LITERAL (sin alias ni
 * destructuring); así el transformer de Expo reemplaza el texto por el valor al bundlear.
 */
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
};

/**
 * ¿Hay backend real configurado? Si NO, la app usa gateways stub (modo demo). Al llenar las
 * EXPO_PUBLIC_* de Cognito, se activa el gateway real.
 */
export const isBackendConfigured = (): boolean =>
  config.apiBaseUrl !== '' &&
  config.cognito.userPoolId !== '' &&
  config.cognito.clientId !== '';
