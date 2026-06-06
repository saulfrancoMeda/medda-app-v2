import { err, ok, type Result } from '@domain/shared/result';
import type { AccountStatement, UserProfile } from '@domain/account/entities/Profile';
import type {
  AccountError,
  AccountRepository,
  ChangeNipInput,
  ChangePasswordInput,
} from '@domain/account/ports/AccountRepository';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

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
  if (e.status === 401) return { type: 'unauthorized' };
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
}
