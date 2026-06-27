export interface Session {
  readonly username: string;
  readonly accessToken: string;
  readonly idToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

export interface AnonymousToken {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresAt: number;
}
