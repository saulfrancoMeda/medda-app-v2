import { err, ok, type Result } from '@domain/shared/result';
import type { PasswordRecovery, RecoveryError } from '@domain/auth/ports/PasswordRecovery';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

const toRecoveryError = (e: HttpError): RecoveryError => {
  if (e.kind === 'network') return { type: 'network' };
  return { type: 'unknown', message: e.message };
};

// Nombres de params best-effort según el legacy; verificar contra el backend real.
export class MedaPasswordRecovery implements PasswordRecovery {
  constructor(private readonly http: HttpClient) {}

  async sendCode(phone: string): Promise<Result<void, RecoveryError>> {
    const lock = await this.http.request<{ locked?: boolean }>(endpoints.checkUserLock, {
      body: { cellphone: phone },
    });
    if (lock.ok && lock.value.locked) return err({ type: 'locked' });

    const res = await this.http.request<unknown>(endpoints.phoneSendCode, {
      body: { cellphone: phone },
    });
    if (!res.ok) return err(toRecoveryError(res.error));
    return ok(undefined);
  }

  async validateCode(phone: string, code: string): Promise<Result<void, RecoveryError>> {
    const res = await this.http.request<unknown>(endpoints.validateCode, {
      body: { cellphone: phone, code },
    });
    if (!res.ok) {
      return err(res.error.status === 400 ? { type: 'invalid_code' } : toRecoveryError(res.error));
    }
    return ok(undefined);
  }

  async resetPassword(
    phone: string,
    code: string,
    newPassword: string,
  ): Promise<Result<void, RecoveryError>> {
    const res = await this.http.request<unknown>(endpoints.changePasswordPublic, {
      body: { cellphone: phone, code, password: newPassword },
    });
    if (!res.ok) return err(toRecoveryError(res.error));
    return ok(undefined);
  }
}
