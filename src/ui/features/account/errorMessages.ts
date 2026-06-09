import type { AccountError } from '@domain/account/ports/AccountRepository';

export const accountErrorMessage = (e: AccountError): string => {
  switch (e.type) {
    case 'unauthorized':
      return 'Datos incorrectos. Verifica tu contraseña o NIP.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return 'No se pudo completar la operación. Intenta de nuevo.';
  }
};

export const unlockErrorMessage = (e: AccountError): string =>
  e.type === 'unauthorized'
    ? 'Datos incorrectos. Verifícalos e intenta de nuevo.'
    : e.type === 'network'
      ? 'Revisa tu conexión a internet e intenta de nuevo.'
      : 'No se pudo desbloquear tu usuario. Intenta de nuevo.';
