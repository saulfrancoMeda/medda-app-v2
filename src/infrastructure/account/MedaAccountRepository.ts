import { err, ok, type Result } from '@domain/shared/result';
import type { AccountStatement, Beneficiary, UserProfile } from '@domain/account/entities/Profile';
import type {
  AccountError,
  AccountRepository,
  CancelAccountInput,
  ChangeNipInput,
  ChangePasswordInput,
} from '@domain/account/ports/AccountRepository';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';
import { isNipError } from '@infrastructure/http/apiError';

interface RawProfileFields {
  firstName?: string;
  lastName?: string;
  lastName2?: string;
  email?: string;
  cellphone?: string;
  phone?: string;
  birthDate?: string;
  rfc?: string;
  curp?: string;
  lastLogin?: string;
  homeAddress?: { street?: string; colony?: string; postalCode?: string; reference?: string };
}

// El perfil viene bajo `info` (Account.js usa __loadData(..., 'info', ...)); aceptamos también
// `profile` o la raíz como respaldo.
interface RawProfile extends RawProfileFields {
  info?: RawProfileFields;
  profile?: RawProfileFields;
}

const toAccountError = (e: HttpError): AccountError => {
  if (e.kind === 'network') return { type: 'network' };
  if (e.status === 401 || isNipError(e.message)) return { type: 'unauthorized' };
  return { type: 'unknown', message: e.message };
};

export class MedaAccountRepository implements AccountRepository {
  constructor(private readonly http: HttpClient) {}

  async getProfile(): Promise<Result<UserProfile, AccountError>> {
    const res = await this.http.request<RawProfile>(endpoints.userProfile);
    if (!res.ok) return err(toAccountError(res.error));
    const p: RawProfileFields = res.value.info ?? res.value.profile ?? res.value;
    return ok({
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      lastName2: p.lastName2,
      email: p.email,
      cellphone: p.cellphone,
      phone: p.phone,
      birthDate: p.birthDate,
      rfc: p.rfc,
      curp: p.curp,
      lastLogin: p.lastLogin,
      homeAddress: p.homeAddress,
    });
  }

  async changePassword(input: ChangePasswordInput): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.changePasswordAuthenticated, {
      body: { oldPassword: input.oldPassword, newPassword: input.newPassword, nip: input.nip },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async changeNip(input: ChangeNipInput): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.nipChange, {
      body: { password: input.password, oldNip: input.oldNip, newNip: input.newNip },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async listStatements(): Promise<Result<readonly AccountStatement[], AccountError>> {
    const res = await this.http.request<{
      accountStatements?: { id?: string; from?: string; to?: string }[];
    }>(endpoints.accountStatementsList);
    if (!res.ok) return err(toAccountError(res.error));
    const statements: AccountStatement[] = (res.value.accountStatements ?? []).map((s) => ({
      id: s.id ?? '',
      from: s.from ?? '',
      to: s.to ?? '',
    }));
    return ok(statements);
  }

  async getStatementPdfUrl(
    statementId: string,
    nip: string,
  ): Promise<Result<string, AccountError>> {
    const res = await this.http.request<{ location?: string }>(endpoints.accountStatementPdf, {
      body: { accountStatement: statementId, nip, requireFiscalVoucher: 0 },
    });
    if (!res.ok) return err(toAccountError(res.error));
    if (!res.value.location) return err({ type: 'unknown', message: 'No se obtuvo el PDF' });
    return ok(res.value.location);
  }

  async changeEmail(email: string, nip: string): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.emailChange, { body: { email, nip } });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async sendNumberChangeCode(phone: string, nip: string): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.usernameChangeCodeSend, {
      body: { phone, nip },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async setNumber(phone: string, code: string, nip: string): Promise<Result<true, AccountError>> {
    const validate = await this.http.request<unknown>(endpoints.usernameChangeCodeValidate, {
      body: { code },
    });
    if (!validate.ok) return err(toAccountError(validate.error));
    const res = await this.http.request<unknown>(endpoints.usernameChangeSet, {
      body: { username: phone, code, nip },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async getBeneficiaries(): Promise<Result<readonly Beneficiary[], AccountError>> {
    const res = await this.http.request<{
      beneficiaries?: { firstName?: string; lastName?: string; lastName2?: string; percent?: number; birthDate?: string }[];
    }>(endpoints.beneficiariesList);
    if (!res.ok) return err(toAccountError(res.error));
    const beneficiaries: Beneficiary[] = (res.value.beneficiaries ?? []).map((b) => ({
      firstName: b.firstName ?? '',
      lastName: b.lastName ?? '',
      lastName2: b.lastName2,
      percent: b.percent,
      birthDate: b.birthDate,
    }));
    return ok(beneficiaries);
  }

  async validatePassword(password: string): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.passwordValidate, {
      body: { password },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async setNip(password: string, nip: string): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.nipSet, { body: { password, nip } });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async sendEmailValidationCode(): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.emailValidationCodeSend, { body: {} });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async validateEmailValidationCode(code: string): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.emailValidationCodeValidate, {
      body: { code },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async cancelAccount(input: CancelAccountInput): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.cancelAccount, {
      body: {
        clabe: input.clabe,
        bank: input.bank,
        beneficiaryName: input.beneficiaryName,
        ...(input.email ? { email: input.email } : {}),
        nip: input.nip,
      },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async sendUnlockCode(cellphone: string, email: string): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.unlockCodeSend, {
      body: { cellphone, email },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }

  async validateUnlockCode(
    cellphone: string,
    email: string,
    code: string,
  ): Promise<Result<true, AccountError>> {
    const res = await this.http.request<unknown>(endpoints.unlockCodeValidate, {
      body: { cellphone, email, code },
    });
    if (!res.ok) return err(toAccountError(res.error));
    return ok(true);
  }
}

