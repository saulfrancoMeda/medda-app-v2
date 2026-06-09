import type { WalletError } from '@domain/wallet/ports/WalletRepository';

export const walletErrorMessage = (e: WalletError): string => {
  switch (e.type) {
    case 'unauthorized':
      return 'NIP incorrecto o sesión expirada.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return 'No se pudo completar la operación. Intenta de nuevo.';
  }
};
