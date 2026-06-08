import { err, ok, type Result } from '@domain/shared/result';
import type { PasswordRecovery, RecoveryError } from '@domain/auth/ports/PasswordRecovery';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

const toRecoveryError = (e: HttpError): RecoveryError => {
  if (e.kind === 'network') return { type: 'network' };
  return { type: 'unknown', message: e.message };
};

// Nombres de params alineados al legacy (RecoveryPasswordCode.js / api.js):
//  - sendCode: getPhoneCode(phone, false) -> { phone, validate: false }
//  - validateCode: validCode(code, phone, 0) -> { code, phone, omitUserValidation: 0 }
//  - resetPassword: publicPasswordChange(phone, code, password) -> { phone, code, password }
export class MedaPasswordRecovery implements PasswordRecovery {
  constructor(private readonly http: HttpClient) {}

  async sendCode(phone: string): Promise<Result<void, RecoveryError>> {
    const res = await this.http.request<unknown>(endpoints.phoneSendCode, {
      body: { phone, validate: false },
    });
    if (!res.ok) return err(toRecoveryError(res.error));
    return ok(undefined);
  }

  async validateCode(phone: string, code: string): Promise<Result<void, RecoveryError>> {
    const res = await this.http.request<unknown>(endpoints.validateCode, {
      body: { code, phone, omitUserValidation: 0 },
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
      body: { phone, code, password: newPassword },
    });
    if (!res.ok) return err(toRecoveryError(res.error));
    return ok(undefined);
  }
}
