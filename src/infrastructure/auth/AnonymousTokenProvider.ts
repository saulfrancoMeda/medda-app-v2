import { config } from '@config/env';

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
}

export class AnonymousTokenProvider {
  private token: string | null = null;
  private expiresAt = 0;

  async getToken(): Promise<string | null> {
    if (this.token && Date.now() < this.expiresAt - 60_000) {
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
      if (!response.ok) return null;
      const json = (await response.json()) as TokenResponse;
      if (!json.access_token) return null;
      this.token = json.access_token;
      this.expiresAt = Date.now() + (json.expires_in ?? 3600) * 1000;
      return this.token;
    } catch {
      return null;
    }
  }
}
