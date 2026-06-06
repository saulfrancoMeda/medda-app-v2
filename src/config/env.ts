/**
 * Configuración por entorno. Los valores vienen de variables EXPO_PUBLIC_* (definidas en
 * `.env` local o en EAS por perfil). NUNCA se commitean secretos: ver `.env.example`.
 *
 * Claves equivalentes al `app/config.js` del legacy:
 *   uriBase -> EXPO_PUBLIC_API_BASE_URL
 *   uriAlt  -> EXPO_PUBLIC_API_ALT_URL
 *   clientId/clientSecret -> EXPO_PUBLIC_OAUTH_CLIENT_ID / _SECRET
 *   awsRegion/awsPoolId/awsClientId -> EXPO_PUBLIC_COGNITO_*
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
  /** Header estático del legacy (no es secreto). */
  readonly xAuthToken: string;
}

const env = process.env;

export const config: AppConfig = {
  apiBaseUrl: env.EXPO_PUBLIC_API_BASE_URL ?? '',
  apiAltUrl: env.EXPO_PUBLIC_API_ALT_URL ?? '',
  oauthClientId: env.EXPO_PUBLIC_OAUTH_CLIENT_ID ?? '',
  oauthClientSecret: env.EXPO_PUBLIC_OAUTH_CLIENT_SECRET ?? '',
  cognito: {
    region: env.EXPO_PUBLIC_COGNITO_REGION ?? '',
    userPoolId: env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? '',
    clientId: env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '',
  },
  appVersion: env.EXPO_PUBLIC_APP_VERSION ?? '0.0.1',
  xAuthToken: env.EXPO_PUBLIC_X_AUTH_TOKEN ?? 'asdf46asdg16f7h0y',
};

/**
 * ¿Hay backend real configurado? Si NO, la app usa gateways stub (modo demo) para que el
 * flujo de UI funcione sin credenciales. En cuanto se llenen las EXPO_PUBLIC_* de Cognito,
 * se activa el gateway real.
 */
export const isBackendConfigured = (): boolean =>
  config.apiBaseUrl !== '' &&
  config.cognito.userPoolId !== '' &&
  config.cognito.clientId !== '';
