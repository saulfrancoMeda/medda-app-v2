import type { Result } from '@domain/shared/result';

export type RecoveryError =
  | { readonly type: 'locked' }
  | { readonly type: 'invalid_code' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

/**
 * Recuperación de contraseña (endpoints PÚBLICOS). Paridad con el legacy:
 * lock check -> enviar código SMS -> validar código -> fijar nueva contraseña.
 */
export interface PasswordRecovery {
  sendCode(phone: string): Promise<Result<void, RecoveryError>>;
  validateCode(phone: string, code: string): Promise<Result<void, RecoveryError>>;
  resetPassword(phone: string, code: string, newPassword: string): Promise<Result<void, RecoveryError>>;
}
