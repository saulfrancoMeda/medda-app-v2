import type { AuthError } from '@domain/auth/ports/AuthGateway';
import type { LookupError } from '@domain/auth/ports/UserDirectory';
import type { RecoveryError } from '@domain/auth/ports/PasswordRecovery';
import type { RegistrationError } from '@domain/registration/ports/RegistrationGateway';

export const authErrorMessage = (error: AuthError): string => {
  switch (error.type) {
    case 'invalid_credentials':
      return 'Usuario o contraseña incorrectos. Verifícalos e intenta de nuevo.';
    case 'account_locked':
      return 'Tu cuenta está bloqueada. Comunícate al Centro de Atención.';
    case 'too_many_attempts':
      return 'Se superaron los intentos de inicio de sesión. Intenta más tarde.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return 'No pudimos iniciar sesión. Intenta de nuevo en un momento.';
  }
};

export const lookupErrorMessage = (error: LookupError): string => {
  switch (error.type) {
    case 'not_found':
      return 'Usuario inválido. Verifica tu número.';
    case 'account_cancel_requested':
      return 'Cancelación de cuenta solicitada. Usuario bloqueado.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return 'No pudimos validar tu número. Intenta de nuevo.';
  }
};

export const registrationErrorMessage = (e: RegistrationError): string => {
  switch (e.type) {
    case 'phone_taken':
      return 'Ese número ya tiene una cuenta. Inicia sesión.';
    case 'invalid_code':
      return 'Código incorrecto. Verifícalo e intenta de nuevo.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return e.message || 'No se pudo completar el registro. Intenta de nuevo.';
  }
};

export const recoveryErrorMessage = (e: RecoveryError): string => {
  switch (e.type) {
    case 'locked':
      return 'Tu cuenta está bloqueada. Comunícate al Centro de Atención.';
    case 'invalid_code':
      return 'Código incorrecto. Verifícalo e intenta de nuevo.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return 'No se pudo completar la operación. Intenta de nuevo.';
  }
};
