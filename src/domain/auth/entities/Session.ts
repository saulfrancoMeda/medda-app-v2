/**
 * Modelo de sesión. La app legacy maneja DOS tokens en paralelo (ver
 * app/src/AppConfig/apiBase.js del proyecto legacy): un Bearer de OAuth2 (password-grant)
 * y los tokens de Cognito (JWT). Ambos se modelan explícitos aquí; el SessionManager
 * decide cuál usar y cuándo refrescar.
 */
export interface OAuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  /** Normalmente "Bearer". */
  readonly tokenType: string;
  /** Epoch en milisegundos en que expira el accessToken. */
  readonly expiresAt: number;
}

export interface CognitoTokens {
  readonly idToken: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  /** Epoch en milisegundos en que expira. */
  readonly expiresAt: number;
}

export interface Session {
  readonly username: string;
  readonly oauth: OAuthTokens;
  /** Opcional: algunos flujos solo usan OAuth hasta completar el alta. */
  readonly cognito?: CognitoTokens;
}
