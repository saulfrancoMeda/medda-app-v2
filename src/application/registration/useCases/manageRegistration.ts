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
  RegistrationError,
  RegistrationGateway,
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
