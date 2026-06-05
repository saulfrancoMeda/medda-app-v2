import type { Result } from '@domain/shared/result';
import type { AuthError, AuthGateway, Credentials } from '@domain/auth/ports/AuthGateway';
import type { SessionStore } from '@domain/auth/ports/SessionStore';
import type { Session } from '@domain/auth/entities/Session';

export interface LoginDeps {
  readonly auth: AuthGateway;
  readonly store: SessionStore;
}

/**
 * Caso de uso: iniciar sesión. Orquesta el puerto de auth y persiste la sesión.
 * Es una factory (inyección de dependencias por closure) para que sea trivial de testear
 * con mocks de los puertos, sin tocar React ni la red real.
 */
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
