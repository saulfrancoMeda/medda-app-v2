import type { Result } from '@domain/shared/result';
import type { Session } from '@domain/auth/entities/Session';

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

/** Errores de auth como unión discriminada: exhaustivos en el `when`/`switch` de la UI. */
export type AuthError =
  | { readonly type: 'invalid_credentials' }
  | { readonly type: 'account_locked' }
  | { readonly type: 'too_many_attempts'; readonly retryAfterSeconds?: number }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

/**
 * Puerto de autenticación. La infraestructura lo implementa (Cognito + OAuth); el dominio
 * solo conoce esta interfaz. Para portar a nativo, el lado Kotlin/Swift implementa el mismo
 * contrato.
 */
export interface AuthGateway {
  login(credentials: Credentials): Promise<Result<Session, AuthError>>;
  refresh(session: Session): Promise<Result<Session, AuthError>>;
  logout(session: Session): Promise<Result<void, AuthError>>;
}
