import type { OAuthTokens, Session } from '@domain/auth/entities/Session';

/** Margen para refrescar antes de la expiración real (evita carreras con la red). */
export const REFRESH_SKEW_MS = 60_000;

/**
 * Lógica pura de sesión. Recibe `now` como parámetro (no llama a Date.now()) para ser
 * determinista y 100% testeable, y para trasladarse sin cambios a Kotlin/Swift.
 */
export const isOAuthExpired = (tokens: OAuthTokens, now: number): boolean =>
  now >= tokens.expiresAt;

export const oauthNeedsRefresh = (tokens: OAuthTokens, now: number): boolean =>
  now >= tokens.expiresAt - REFRESH_SKEW_MS;

export const sessionNeedsRefresh = (session: Session, now: number): boolean =>
  oauthNeedsRefresh(session.oauth, now);

/** Header Authorization que la capa HTTP debe enviar para llamadas autenticadas por OAuth. */
export const authorizationHeader = (session: Session): string =>
  `${session.oauth.tokenType} ${session.oauth.accessToken}`;
