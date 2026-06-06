import type { AuthError } from '@domain/auth/ports/AuthGateway';
import type { LookupError } from '@domain/auth/ports/UserDirectory';

/** Mapea los errores de auth a mensajes en español (paridad con el legacy). */
export const authErrorMessage = (error: AuthError): string => {
  switch (error.type) {
    case 'invalid_credentials':
      return 'Verifica tus credenciales';
    case 'account_locked':
      return 'Tu cuenta está bloqueada';
    case 'too_many_attempts':
      return 'Se superaron los intentos de inicio de sesión';
    case 'network':
      return 'Hubo un error, revisa tu conexión a internet';
    case 'unknown':
      return error.message || 'Ocurrió un error inesperado';
  }
};

/** Mapea los errores de validación del teléfono (paso 1) a mensajes en español. */
export const lookupErrorMessage = (error: LookupError): string => {
  switch (error.type) {
    case 'not_found':
      return 'Usuario inválido. Verifica tu número.';
    case 'account_cancel_requested':
      return 'Cancelación de cuenta solicitada. Usuario bloqueado.';
    case 'network':
      return 'Hubo un error, revisa tu conexión a internet';
    case 'unknown':
      return error.message || 'No pudimos validar tu número';
  }
};
