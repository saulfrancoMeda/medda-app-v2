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

/**
 * Provee el valor del header Authorization según el tipo de endpoint. Lo inyecta la capa de
 * auth (token anónimo para 'public', JWT de Cognito para 'user'). Devuelve null si no aplica.
 */
export type AuthHeaderProvider = (auth: Endpoint['auth']) => Promise<string | null>;

export interface RequestOptions {
  readonly query?: Record<string, string | number | boolean | undefined>;
  readonly body?: unknown;
  /** HTTP statuses the caller handles as normal control flow (e.g. 404 = phone available); not logged. */
  readonly silentStatuses?: readonly number[];
}

/**
 * Capa HTTP. Replica los headers del legacy (apiBase.js): Content-Type, X-Auth-Token,
 * X-App-Version y Authorization condicional. Devuelve Result en vez de lanzar.
 */
export class HttpClient {
  constructor(
    private readonly getAuthHeader: AuthHeaderProvider,
    private readonly baseUrl: string = config.apiBaseUrl,
  ) {}

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
    // For multipart, let fetch set Content-Type (with the boundary); for everything else use JSON.
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
      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body,
      });
      const text = await response.text();
      const parsed: unknown = text ? JSON.parse(text) : null;

      if (!response.ok) {
        // Por ahora se loguea TODO (status + cuerpo) para que el equipo de backend sepa por qué
        // falla el servicio, salvo los status que el caller maneja como flujo normal.
        if (!options.silentStatuses?.includes(response.status)) {
          console.warn(`[API] ${endpoint.method} ${endpoint.path} -> ${response.status}`, parsed);
        }
        return err({
          kind: 'http',
          status: response.status,
          body: parsed,
          // Mensaje real del backend si lo hay; si no, el status. (Más adelante: solo status.)
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
