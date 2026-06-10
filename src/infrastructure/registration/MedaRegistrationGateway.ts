import { err, ok, type Result } from '@domain/shared/result';
import type { RegistrationDraft } from '@domain/registration/entities/Registration';
import type {
  RegistrationError,
  RegistrationGateway,
} from '@domain/registration/ports/RegistrationGateway';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

const toError = (e: HttpError): RegistrationError => {
  if (e.kind === 'network') return { type: 'network' };
  return { type: 'unknown', message: e.message };
};

export class MedaRegistrationGateway implements RegistrationGateway {
  constructor(private readonly http: HttpClient) {}

  // GET /public/user/name returns a masked name when the phone is already registered; 404 means free.
  async isPhoneAvailable(phone: string): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<{ user?: string }>(endpoints.getUserName, {
      query: { cellphone: phone },
    });
    if (res.ok) {
      return res.value.user ? err({ type: 'phone_taken' }) : ok(true);
    }
    if (res.error.status === 404) return ok(true);
    if (res.error.kind === 'network') return err({ type: 'network' });
    return err({ type: 'unknown', message: res.error.message });
  }

  async sendVerificationCode(phone: string): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<unknown>(endpoints.phoneSendCode, {
      body: { phone, validate: 1 },
    });
    if (!res.ok) return err(toError(res.error));
    return ok(true);
  }

  async validateVerificationCode(
    phone: string,
    code: string,
  ): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<unknown>(endpoints.validateCode, {
      body: { code, phone, omitUserValidation: 1 },
    });
    if (!res.ok) {
      if (res.error.kind === 'network') return err({ type: 'network' });
      return err({ type: 'invalid_code' });
    }
    return ok(true);
  }

  // Core account payload. KYC fields (demographics, CURP, address, documents) are added in later
  // phases; the backend may require them before accepting the account.
  async register(draft: RegistrationDraft): Promise<Result<true, RegistrationError>> {
    const res = await this.http.request<unknown>(endpoints.register, {
      body: {
        cellphone: draft.phone,
        firstName: draft.firstName,
        lastName: draft.lastName,
        lastName2: draft.lastName2,
        email: draft.email,
        password: draft.password,
        nip: draft.nip,
        ...(draft.birthDate ? { birthDate: draft.birthDate } : {}),
        ...(draft.curp ? { curp: draft.curp } : {}),
        additionalData: {
          termsAndConditionsCheck: draft.acceptedTerms,
          noticeOfPrivacyCheck: draft.acceptedPrivacy,
          accountOpeningCheck: draft.acceptedAccountOpening,
        },
      },
    });
    if (!res.ok) return err(toError(res.error));
    return ok(true);
  }
}
