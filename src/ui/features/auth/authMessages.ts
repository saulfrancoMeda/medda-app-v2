import type { AuthError } from '@domain/auth/ports/AuthGateway';

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
