import { describe, expect, it } from '@jest/globals';
import type { Session } from '@domain/auth/entities/Session';
import {
  authorizationHeader,
  isOAuthExpired,
  oauthNeedsRefresh,
  REFRESH_SKEW_MS,
} from '@domain/auth/services/SessionManager';

const NOW = 1_000_000;

const sessionExpiringAt = (expiresAt: number): Session => ({
  username: 'agente@meda.com.mx',
  oauth: { accessToken: 'tok', refreshToken: 'ref', tokenType: 'Bearer', expiresAt },
});

describe('SessionManager', () => {
  it('detecta cuando el token OAuth está expirado', () => {
    expect(isOAuthExpired(sessionExpiringAt(NOW - 1).oauth, NOW)).toBe(true);
    expect(isOAuthExpired(sessionExpiringAt(NOW + 1).oauth, NOW)).toBe(false);
  });

  it('necesita refresh dentro del margen (skew) antes de expirar', () => {
    expect(oauthNeedsRefresh(sessionExpiringAt(NOW + REFRESH_SKEW_MS - 1).oauth, NOW)).toBe(true);
    expect(oauthNeedsRefresh(sessionExpiringAt(NOW + REFRESH_SKEW_MS + 1).oauth, NOW)).toBe(false);
  });

  it('arma el header Authorization con el tipo de token', () => {
    expect(authorizationHeader(sessionExpiringAt(NOW))).toBe('Bearer tok');
  });
});
