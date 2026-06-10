import { err, type Result } from '@domain/shared/result';
import {
  isValidName,
  isValidNip,
  isValidOtp,
  isValidPhone,
  validatePassword,
} from '@domain/registration/services/credentials';
import type { RegistrationDraft } from '@domain/registration/entities/Registration';
import type {
  CatalogItem,
  DocumentImage,
  DocumentRequirement,
  OcrResult,
  RegistrationError,
  RegistrationGateway,
  TransactionalQuestion,
} from '@domain/registration/ports/RegistrationGateway';

type Deps = { readonly gateway: RegistrationGateway };

export const makeCheckPhoneAvailable =
  ({ gateway }: Deps) =>
  (phone: string): Promise<Result<true, RegistrationError>> => {
    if (!isValidPhone(phone)) {
      return Promise.resolve(err({ type: 'unknown', message: 'Teléfono inválido.' }));
    }
    return gateway.isPhoneAvailable(phone);
  };

export const makeSendVerificationCode =
  ({ gateway }: Deps) =>
  (phone: string): Promise<Result<true, RegistrationError>> => {
    if (!isValidPhone(phone)) {
      return Promise.resolve(err({ type: 'unknown', message: 'Teléfono inválido.' }));
    }
    return gateway.sendVerificationCode(phone);
  };

export const makeValidateVerificationCode =
  ({ gateway }: Deps) =>
  (phone: string, code: string): Promise<Result<true, RegistrationError>> => {
    if (!isValidOtp(code)) return Promise.resolve(err({ type: 'invalid_code' }));
    return gateway.validateVerificationCode(phone, code);
  };

export const makeGetRequiredDocuments =
  ({ gateway }: Deps) =>
  (
    nationality: string,
    resident: string,
  ): Promise<Result<DocumentRequirement, RegistrationError>> =>
    gateway.getRequiredDocuments(nationality, resident);

export const makeExtractDocumentData =
  ({ gateway }: Deps) =>
  (documentId: string, image: DocumentImage): Promise<Result<OcrResult, RegistrationError>> =>
    gateway.extractDocumentData(documentId, image);

export const makeGetTransactionalProfileQuestions =
  ({ gateway }: Deps) =>
  (): Promise<Result<readonly TransactionalQuestion[], RegistrationError>> =>
    gateway.getTransactionalProfileQuestions();

export const makeGetOccupations =
  ({ gateway }: Deps) =>
  (): Promise<Result<readonly CatalogItem[], RegistrationError>> =>
    gateway.getOccupations();

export const makeRegister =
  ({ gateway }: Deps) =>
  (draft: RegistrationDraft): Promise<Result<true, RegistrationError>> => {
    if (!isValidName(draft.firstName) || !isValidName(draft.lastName)) {
      return Promise.resolve(err({ type: 'unknown', message: 'Revisa tu nombre y apellidos.' }));
    }
    if (validatePassword(draft.password, { phone: draft.phone, birthDate: draft.birthDate })) {
      return Promise.resolve(
        err({ type: 'unknown', message: 'Tu contraseña no cumple los requisitos.' }),
      );
    }
    if (!isValidNip(draft.nip)) {
      return Promise.resolve(err({ type: 'unknown', message: 'Tu NIP debe tener 6 dígitos.' }));
    }
    if (!draft.acceptedTerms || !draft.acceptedPrivacy || !draft.acceptedAccountOpening) {
      return Promise.resolve(
        err({ type: 'unknown', message: 'Debes aceptar los términos para continuar.' }),
      );
    }
    return gateway.register(draft);
  };
