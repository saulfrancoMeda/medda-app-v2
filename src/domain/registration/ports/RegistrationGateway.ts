import type { Result } from '@domain/shared/result';
import type { RegistrationDraft } from '@domain/registration/entities/Registration';

export type RegistrationError =
  | { readonly type: 'phone_taken' }
  | { readonly type: 'invalid_code' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface RegistrationGateway {
  /** ok(true) when the phone has no account yet; err('phone_taken') when it is already registered. */
  isPhoneAvailable(phone: string): Promise<Result<true, RegistrationError>>;
  sendVerificationCode(phone: string): Promise<Result<true, RegistrationError>>;
  validateVerificationCode(phone: string, code: string): Promise<Result<true, RegistrationError>>;
  register(draft: RegistrationDraft): Promise<Result<true, RegistrationError>>;
}
