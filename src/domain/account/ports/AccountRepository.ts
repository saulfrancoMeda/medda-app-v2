import type { Result } from '@domain/shared/result';
import type {
  AccountStatement,
  Beneficiary,
  UserProfile,
} from '@domain/account/entities/Profile';

export type AccountError =
  | { readonly type: 'unauthorized' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface ChangePasswordInput {
  readonly oldPassword: string;
  readonly newPassword: string;
  readonly nip: string;
}

export interface ChangeNipInput {
  readonly password: string;
  readonly oldNip: string;
  readonly newNip: string;
}

export interface CancelAccountInput {
  readonly clabe: string;
  readonly bank: string;
  readonly beneficiaryName: string;
  readonly email?: string;
  readonly nip: string;
}

export interface AccountRepository {
  getProfile(): Promise<Result<UserProfile, AccountError>>;
  changePassword(input: ChangePasswordInput): Promise<Result<true, AccountError>>;
  changeNip(input: ChangeNipInput): Promise<Result<true, AccountError>>;
  listStatements(): Promise<Result<readonly AccountStatement[], AccountError>>;
  getStatementPdfUrl(statementId: string, nip: string): Promise<Result<string, AccountError>>;
  changeEmail(email: string, nip: string): Promise<Result<true, AccountError>>;
  sendNumberChangeCode(phone: string, nip: string): Promise<Result<true, AccountError>>;
  setNumber(phone: string, code: string, nip: string): Promise<Result<true, AccountError>>;
  getBeneficiaries(): Promise<Result<readonly Beneficiary[], AccountError>>;
  validatePassword(password: string): Promise<Result<true, AccountError>>;
  setNip(password: string, nip: string): Promise<Result<true, AccountError>>;
  sendEmailValidationCode(): Promise<Result<true, AccountError>>;
  validateEmailValidationCode(code: string): Promise<Result<true, AccountError>>;
  cancelAccount(input: CancelAccountInput): Promise<Result<true, AccountError>>;
  sendUnlockCode(cellphone: string, email: string): Promise<Result<true, AccountError>>;
  validateUnlockCode(
    cellphone: string,
    email: string,
    code: string,
  ): Promise<Result<true, AccountError>>;
}
