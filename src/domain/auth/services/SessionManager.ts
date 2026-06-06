import type { AnonymousToken, Session } from '@domain/auth/entities/Session';

/** Margen para refrescar antes de la expiración real (evita carreras con la red). */
export const REFRESH_SKEW_MS = 60_000;

/**
 * Lógica pura de sesión. Recibe `now` como parámetro (no llama a Date.now()) para ser
 * determinista, testeable y trasladable sin cambios a Kotlin/Swift.
 */
export const isSessionExpired = (session: Session, now: number): boolean =>
  now >= session.expiresAt;

export const sessionNeedsRefresh = (session: Session, now: number): boolean =>
  now >= session.expiresAt - REFRESH_SKEW_MS;

/** Valor del header Authorization para llamadas autenticadas: el JWT de Cognito tal cual. */
export const authorizationHeader = (session: Session): string => session.accessToken;

/** Valor del header Authorization para llamadas públicas: `Bearer <token anónimo>`. */
export const anonymousAuthorizationHeader = (token: AnonymousToken): string =>
  `${token.tokenType} ${token.accessToken}`;

export const isAnonymousExpired = (token: AnonymousToken, now: number): boolean =>
  now >= token.expiresAt;
