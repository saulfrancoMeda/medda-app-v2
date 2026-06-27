import type { AnonymousToken, Session } from '@domain/auth/entities/Session';

export const REFRESH_SKEW_MS = 60_000;
export const isSessionExpired = (session: Session, now: number): boolean =>
  now >= session.expiresAt;

export const sessionNeedsRefresh = (session: Session, now: number): boolean =>
  now >= session.expiresAt - REFRESH_SKEW_MS;

export const authorizationHeader = (session: Session): string => session.accessToken;

export const anonymousAuthorizationHeader = (token: AnonymousToken): string =>
  `${token.tokenType} ${token.accessToken}`;

export const isAnonymousExpired = (token: AnonymousToken, now: number): boolean =>
  now >= token.expiresAt;
