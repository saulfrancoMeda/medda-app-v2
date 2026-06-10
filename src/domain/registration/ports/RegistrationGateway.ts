import type { Result } from '@domain/shared/result';
import type { RegistrationDraft } from '@domain/registration/entities/Registration';

export type RegistrationError =
  | { readonly type: 'phone_taken' }
  | { readonly type: 'invalid_code' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface DocumentRequirement {
  readonly documentId: string;
  readonly type: string;
  readonly requiresBack: boolean;
}

export interface DocumentImage {
  readonly uri: string;
  readonly name: string;
  readonly type: string;
}

export interface OcrResult {
  readonly curp?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly lastName2?: string;
  readonly birthDate?: string;
}

export interface TransactionalQuestionOption {
  readonly label: string;
  readonly value: string;
}

export interface TransactionalQuestion {
  readonly key: string;
  readonly text: string;
  readonly options: readonly TransactionalQuestionOption[];
}

// A catalog entry (e.g. occupation): `key` is the value sent to the backend, `label` is shown.
export interface CatalogItem {
  readonly key: string;
  readonly label: string;
}

export interface RegistrationGateway {
  /** ok(true) when the phone has no account yet; err('phone_taken') when it is already registered. */
  isPhoneAvailable(phone: string): Promise<Result<true, RegistrationError>>;
  sendVerificationCode(phone: string): Promise<Result<true, RegistrationError>>;
  validateVerificationCode(phone: string, code: string): Promise<Result<true, RegistrationError>>;
  getRequiredDocuments(
    nationality: string,
    resident: string,
  ): Promise<Result<DocumentRequirement, RegistrationError>>;
  extractDocumentData(
    documentId: string,
    image: DocumentImage,
  ): Promise<Result<OcrResult, RegistrationError>>;
  getTransactionalProfileQuestions(): Promise<
    Result<readonly TransactionalQuestion[], RegistrationError>
  >;
  getOccupations(): Promise<Result<readonly CatalogItem[], RegistrationError>>;
  register(draft: RegistrationDraft): Promise<Result<true, RegistrationError>>;
}
