/**
 * Sesión de usuario. En el legacy el login es Cognito-primario (Auth.signIn con
 * '+52'+phone); la sesión = tokens de Cognito. El `accessToken` (JWT) es el que va en el
 * header Authorization de las llamadas autenticadas.
 */
export interface Session {
  /** Teléfono de 10 dígitos (sin +52) o username de Cognito. */
  readonly username: string;
  /** JWT de Cognito que se manda como Authorization en llamadas autenticadas. */
  readonly accessToken: string;
  readonly idToken: string;
  readonly refreshToken: string;
  /** Epoch en ms en que expira el accessToken. */
  readonly expiresAt: number;
}

/**
 * Token anónimo para endpoints PÚBLICOS (no autenticados). Se obtiene del endpoint OAuth
 * con grant_type=client_credentials y se manda como `Bearer <token>`. Es independiente de
 * la sesión del usuario; lo gestiona la capa de infraestructura.
 */
export interface AnonymousToken {
  readonly accessToken: string;
  readonly tokenType: string; // "Bearer"
  readonly expiresAt: number; // epoch ms
}
