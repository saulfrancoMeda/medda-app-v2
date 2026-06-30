import { config } from '@config/env';
import { logger } from '@config/logger';

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
}

// The server reports expires_in: 3600 but revokes tokens after ~3 minutes.
// Cache for 90 seconds to stay safely within the real server-side TTL.
const TOKEN_CACHE_MS = 90_000;

export class AnonymousTokenProvider {
  private token: string | null = null;
  private expiresAt = 0;

  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }

  async getToken(): Promise<string | null> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }
    try {
      const response = await fetch(`${config.apiBaseUrl}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': config.xAuthToken,
          'X-App-Version': config.appVersion,
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: config.oauthClientId,
          client_secret: config.oauthClientSecret,
          scopes: '',
        }),
      });
      if (!response.ok) {
        logger.warn('[TOKEN] client_credentials failed:', response.status, await response.text());
        return null;
      }
      const json = (await response.json()) as TokenResponse;
      if (!json.access_token) {
        logger.warn('[TOKEN] no access_token in response:', JSON.stringify(json));
        return null;
      }
      logger.warn('[TOKEN] obtained OK from:', config.apiBaseUrl, 'expires_in:', json.expires_in);
      this.token = json.access_token;
      this.expiresAt = Date.now() + TOKEN_CACHE_MS;
      return this.token;
    } catch (e) {
      logger.warn('[TOKEN] network error getting token:', e);
      return null;
    }
  }
}
