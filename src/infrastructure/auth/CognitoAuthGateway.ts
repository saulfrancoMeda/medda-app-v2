import { config } from '@config/env';
import { err, ok, type Result } from '@domain/shared/result';
import type { Session } from '@domain/auth/entities/Session';
import type { AuthError, AuthGateway, Credentials } from '@domain/auth/ports/AuthGateway';

// El legacy usa Cognito con USER_PASSWORD_AUTH y username '+52'+phone (Auth.signIn).
// Aquí llamamos directo a la API InitiateAuth de Cognito por fetch (sin SDK ni crypto nativo).
const PHONE_PREFIX = '+52';

interface AuthenticationResult {
  AccessToken: string;
  IdToken: string;
  RefreshToken?: string;
  ExpiresIn: number;
  TokenType: string;
}
interface InitiateAuthResponse {
  AuthenticationResult?: AuthenticationResult;
  ChallengeName?: string;
  __type?: string;
  message?: string;
}

export class CognitoAuthGateway implements AuthGateway {
  private readonly endpoint = `https://cognito-idp.${config.cognito.region}.amazonaws.com/`;

  async login({ phone, password }: Credentials): Promise<Result<Session, AuthError>> {
    const res = await this.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: config.cognito.clientId,
      AuthParameters: { USERNAME: `${PHONE_PREFIX}${phone}`, PASSWORD: password },
    });
    if (!res.ok) return res;
    const data = res.value;
    if (data.ChallengeName) {
      // p.ej. NEW_PASSWORD_REQUIRED -> en el legacy lleva a "cambiar contraseña" (Fase posterior).
      return err({ type: 'unknown', message: 'Debes cambiar tu contraseña' });
    }
    if (!data.AuthenticationResult) {
      return err({ type: 'unknown', message: 'Respuesta inesperada de Cognito' });
    }
    return ok(this.toSession(phone, data.AuthenticationResult));
  }

  async refresh(session: Session): Promise<Result<Session, AuthError>> {
    const res = await this.initiateAuth({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: config.cognito.clientId,
      AuthParameters: { REFRESH_TOKEN: session.refreshToken },
    });
    if (!res.ok) return res;
    const r = res.value.AuthenticationResult;
    if (!r) return err({ type: 'unknown', message: 'Respuesta inesperada de Cognito' });
    return ok({
      ...session,
      accessToken: r.AccessToken,
      idToken: r.IdToken,
      expiresAt: Date.now() + r.ExpiresIn * 1000,
    });
  }

  async logout(): Promise<Result<void, AuthError>> {
    // El borrado local de la sesión lo hace el SessionStore. (Opcional: GlobalSignOut.)
    return ok(undefined);
  }

  private async initiateAuth(
    body: Record<string, unknown>,
  ): Promise<Result<InitiateAuthResponse, AuthError>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as InitiateAuthResponse;
      if (!response.ok) return err(this.mapError(json));
      return ok(json);
    } catch {
      return err({ type: 'network' });
    }
  }

  private mapError(json: InitiateAuthResponse): AuthError {
    const type = json.__type ?? '';
    const message = json.message ?? '';
    if (type.includes('NotAuthorized')) {
      if (/attempts exceeded/i.test(message)) return { type: 'too_many_attempts' };
      return { type: 'invalid_credentials' };
    }
    if (type.includes('UserNotFound')) return { type: 'invalid_credentials' };
    if (type.includes('PasswordResetRequired')) {
      return { type: 'unknown', message: 'Debes cambiar tu contraseña' };
    }
    if (type.includes('TooManyRequests') || type.includes('LimitExceeded')) {
      return { type: 'too_many_attempts' };
    }
    return { type: 'unknown', message: message || 'Error de autenticación' };
  }

  private toSession(phone: string, r: AuthenticationResult): Session {
    return {
      username: phone,
      accessToken: r.AccessToken,
      idToken: r.IdToken,
      refreshToken: r.RefreshToken ?? '',
      expiresAt: Date.now() + r.ExpiresIn * 1000,
    };
  }
}
