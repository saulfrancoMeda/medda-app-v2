import type { Result } from '@domain/shared/result';

export type RecoveryError =
  | { readonly type: 'locked' }
  | { readonly type: 'invalid_code' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface PasswordRecovery {
  sendCode(phone: string): Promise<Result<void, RecoveryError>>;
  validateCode(phone: string, code: string): Promise<Result<void, RecoveryError>>;
  resetPassword(phone: string, code: string, newPassword: string): Promise<Result<void, RecoveryError>>;
}
