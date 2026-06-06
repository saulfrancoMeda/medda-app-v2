import type { Result } from '@domain/shared/result';

export type LookupError =
  | { readonly type: 'not_found' }
  | { readonly type: 'account_cancel_requested' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

/**
 * Valida un teléfono y devuelve el nombre (ya enmascarado por el backend, p.ej. "S*** F*****").
 * Equivale a GET /public/user/name del legacy. Lo implementa infraestructura.
 */
export interface UserDirectory {
  getName(phone: string): Promise<Result<string, LookupError>>;
}
