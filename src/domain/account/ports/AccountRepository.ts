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
  /** Devuelve la URL del PDF del estado de cuenta (requiere NIP). */
  getStatementPdfUrl(statementId: string, nip: string): Promise<Result<string, AccountError>>;
  changeEmail(email: string, nip: string): Promise<Result<true, AccountError>>;
  /** Cambio de número: envía código al nuevo teléfono (requiere NIP). */
  sendNumberChangeCode(phone: string, nip: string): Promise<Result<true, AccountError>>;
  /** Cambio de número: valida el código y fija el nuevo número. */
  setNumber(phone: string, code: string, nip: string): Promise<Result<true, AccountError>>;
  getBeneficiaries(): Promise<Result<readonly Beneficiary[], AccountError>>;
  /** Confirma la contraseña actual antes de operaciones sensibles (establecer NIP). */
  validatePassword(password: string): Promise<Result<true, AccountError>>;
  /** Establece el NIP por primera vez (requiere confirmar contraseña). */
  setNip(password: string, nip: string): Promise<Result<true, AccountError>>;
  /** Validación de correo: envía el código al correo registrado. */
  sendEmailValidationCode(): Promise<Result<true, AccountError>>;
  /** Validación de correo: valida el código recibido. */
  validateEmailValidationCode(code: string): Promise<Result<true, AccountError>>;
  /** Cancelación de cuenta: dispersa el saldo a una CLABE y cierra la cuenta (requiere NIP). */
  cancelAccount(input: CancelAccountInput): Promise<Result<true, AccountError>>;
  /** Desbloqueo (público): envía código de desbloqueo al celular/correo. */
  sendUnlockCode(cellphone: string, email: string): Promise<Result<true, AccountError>>;
  /** Desbloqueo (público): valida el código de desbloqueo. */
  validateUnlockCode(
    cellphone: string,
    email: string,
    code: string,
  ): Promise<Result<true, AccountError>>;
}
