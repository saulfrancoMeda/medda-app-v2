import type { Result } from '@domain/shared/result';
import type { FaqItem } from '@domain/support/entities/Faq';

export type SupportError =
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface SupportRepository {
  getFaqs(): Promise<Result<readonly FaqItem[], SupportError>>;
}
