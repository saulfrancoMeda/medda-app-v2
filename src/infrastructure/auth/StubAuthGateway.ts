import { err, ok, type Result } from '@domain/shared/result';
import type { Session } from '@domain/auth/entities/Session';
import type { AuthError, AuthGateway, Credentials } from '@domain/auth/ports/AuthGateway';

/**
 * Gateway de PRUEBA (modo demo, sin backend). Permite recorrer el flujo de login mientras no
 * haya credenciales reales de Cognito. Se reemplaza por CognitoAuthGateway cuando
 * isBackendConfigured() sea true. Reglas demo:
 *  - password '000000' -> too_many_attempts (para ver el bloqueo)
 *  - password con < 6 chars -> invalid_credentials
 *  - cualquier otro -> sesión válida por 1 hora
 */
export class StubAuthGateway implements AuthGateway {
  async login(credentials: Credentials): Promise<Result<Session, AuthError>> {
    if (credentials.password === '000000') {
      return err({ type: 'too_many_attempts' });
    }
    if (credentials.password.length < 6) {
      return err({ type: 'invalid_credentials' });
    }
    return ok(this.fakeSession(credentials.phone));
  }

  async refresh(session: Session): Promise<Result<Session, AuthError>> {
    return ok(this.fakeSession(session.username));
  }

  async logout(): Promise<Result<void, AuthError>> {
    return ok(undefined);
  }

  private fakeSession(phone: string): Session {
    return {
      username: phone,
      accessToken: 'stub-access-token',
      idToken: 'stub-id-token',
      refreshToken: 'stub-refresh-token',
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
  }
}
