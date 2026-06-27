import type { BeneficiaryError } from '@domain/beneficiaries/ports/BeneficiaryRepository';

export const beneficiaryErrorMessage = (e: BeneficiaryError): string => {
  switch (e.type) {
    case 'unauthorized':
      return 'Tu sesión expiró. Inicia sesión de nuevo para continuar.';
    case 'network':
      return 'Revisa tu conexión a internet e intenta de nuevo.';
    case 'unknown':
      return 'No se pudieron guardar tus beneficiarios. Intenta de nuevo.';
  }
};
