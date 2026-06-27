import type { Result } from '@domain/shared/result';
import type { Session } from '@domain/auth/entities/Session';

export interface Credentials {
  readonly phone: string;
  readonly password: string;
}
export type AuthError =
  | { readonly type: 'invalid_credentials' }
  | { readonly type: 'account_locked' }
  | { readonly type: 'too_many_attempts'; readonly retryAfterSeconds?: number }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface AuthGateway {
  login(credentials: Credentials): Promise<Result<Session, AuthError>>;
  refresh(session: Session): Promise<Result<Session, AuthError>>;
  logout(session: Session): Promise<Result<void, AuthError>>;
}
