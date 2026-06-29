import { config } from '@config/env';
import { err, ok, type Result } from '@domain/shared/result';
import type { Endpoint } from '@infrastructure/http/endpoints';
import { extractApiMessage } from '@infrastructure/http/apiError';

export interface HttpError {
  readonly kind: 'http' | 'network';
  readonly status: number;
  readonly body?: unknown;
  readonly message: string;
}

export type AuthHeaderProvider = (auth: Endpoint['auth']) => Promise<string | null>;

export interface RequestOptions {
  readonly query?: Record<string, string | number | boolean | undefined>;
  readonly body?: unknown;
  readonly silentStatuses?: readonly number[];
}

export class HttpClient {
  constructor(
    private readonly getAuthHeader: AuthHeaderProvider,
    private readonly baseUrl: string = config.apiBaseUrl,
  ) { }

  async request<T>(
    endpoint: Endpoint,
    options: RequestOptions = {},
  ): Promise<Result<T, HttpError>> {
    const url = this.buildUrl(endpoint.path, options.query);
    const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      'X-Auth-Token': config.xAuthToken,
      'X-App-Version': config.appVersion,
    };
    if (!isMultipart) headers['Content-Type'] = 'application/json';
    const authValue = await this.getAuthHeader(endpoint.auth);
    if (authValue) {
      headers.Authorization = authValue;
    }

    try {
      const body =
        options.body === undefined
          ? undefined
          : isMultipart
            ? (options.body as FormData)
            : JSON.stringify(options.body);

      if (__DEV__ && options.body !== undefined && !isMultipart) {
        const PII_FIELDS = ['password', 'nip', 'nipSignature', 'cellphone', 'phone',
          'firstName', 'lastName', 'lastName2', 'email', 'curp', 'rfc', 'birthDate'];
        const redacted = JSON.parse(JSON.stringify(options.body));
        for (const f of PII_FIELDS) { if (f in redacted) redacted[f] = '***'; }
        console.log(`[API →] ${endpoint.method} ${endpoint.path}`, JSON.stringify(redacted, null, 2));
      }

      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body,
      });
      const text = await response.text();
      const parsed: unknown = text ? JSON.parse(text) : null;

      if (!response.ok) {
        if (!options.silentStatuses?.includes(response.status)) {
          console.warn(`[API] ${endpoint.method} ${endpoint.path} -> ${response.status}`, parsed);
        }
        return err({
          kind: 'http',
          status: response.status,
          body: parsed,
          message: extractApiMessage(parsed) ?? `Error ${response.status}`,
        });
      }
      return ok(parsed as T);
    } catch (e) {
      console.warn(`[API] ${endpoint.method} ${endpoint.path} -> network error`, e);
      return err({
        kind: 'network',
        status: 0,
        message: 'Hubo un error al obtener los datos, revise su conexión a internet.',
        body: e,
      });
    }
  }

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const base = `${this.baseUrl}${path}`;
    if (!query) return base;
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return qs ? `${base}?${qs}` : base;
  }
}
