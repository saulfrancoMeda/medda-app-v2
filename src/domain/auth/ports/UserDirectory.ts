import type { Result } from '@domain/shared/result';

export type LookupError =
  | { readonly type: 'not_found' }
  | { readonly type: 'account_cancel_requested' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface UserDirectory {
  getName(phone: string): Promise<Result<string, LookupError>>;
}
