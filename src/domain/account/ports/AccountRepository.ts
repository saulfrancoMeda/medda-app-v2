import type { Result } from '@domain/shared/result';
import type { AccountStatement, UserProfile } from '@domain/account/entities/Profile';

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

export interface AccountRepository {
  getProfile(): Promise<Result<UserProfile, AccountError>>;
  changePassword(input: ChangePasswordInput): Promise<Result<true, AccountError>>;
  changeNip(input: ChangeNipInput): Promise<Result<true, AccountError>>;
  listStatements(): Promise<Result<readonly AccountStatement[], AccountError>>;
  /** Devuelve la URL del PDF del estado de cuenta (requiere NIP). */
  getStatementPdfUrl(statementId: string, nip: string): Promise<Result<string, AccountError>>;
}
