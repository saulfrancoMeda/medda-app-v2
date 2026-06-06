import { describe, expect, it } from '@jest/globals';
import type { AnonymousToken, Session } from '@domain/auth/entities/Session';
import {
  anonymousAuthorizationHeader,
  authorizationHeader,
  isSessionExpired,
  REFRESH_SKEW_MS,
  sessionNeedsRefresh,
} from '@domain/auth/services/SessionManager';

const NOW = 1_000_000;

const sessionExpiringAt = (expiresAt: number): Session => ({
  username: '5512345678',
  accessToken: 'jwt-access',
  idToken: 'jwt-id',
  refreshToken: 'refresh',
  expiresAt,
});

describe('SessionManager', () => {
  it('detecta cuando la sesión está expirada', () => {
    expect(isSessionExpired(sessionExpiringAt(NOW - 1), NOW)).toBe(true);
    expect(isSessionExpired(sessionExpiringAt(NOW + 1), NOW)).toBe(false);
  });

  it('necesita refresh dentro del margen (skew) antes de expirar', () => {
    expect(sessionNeedsRefresh(sessionExpiringAt(NOW + REFRESH_SKEW_MS - 1), NOW)).toBe(true);
    expect(sessionNeedsRefresh(sessionExpiringAt(NOW + REFRESH_SKEW_MS + 1), NOW)).toBe(false);
  });

  it('usa el JWT de Cognito tal cual como Authorization autenticado', () => {
    expect(authorizationHeader(sessionExpiringAt(NOW))).toBe('jwt-access');
  });

  it('usa Bearer para el token anónimo (llamadas públicas)', () => {
    const anon: AnonymousToken = { accessToken: 'anon', tokenType: 'Bearer', expiresAt: NOW };
    expect(anonymousAuthorizationHeader(anon)).toBe('Bearer anon');
  });
});
