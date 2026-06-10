import type { Result } from '@domain/shared/result';
import type { AuthError, AuthGateway, Credentials } from '@domain/auth/ports/AuthGateway';
import type { SessionStore } from '@domain/auth/ports/SessionStore';
import type { Session } from '@domain/auth/entities/Session';

export interface LoginDeps {
  readonly auth: AuthGateway;
  readonly store: SessionStore;
}

export const makeLogin =
  (deps: LoginDeps) =>
    async (credentials: Credentials): Promise<Result<Session, AuthError>> => {
      const result = await deps.auth.login(credentials);
      if (!result.ok) {
        return result;
      }
      await deps.store.write(result.value);
      return result;
    };
