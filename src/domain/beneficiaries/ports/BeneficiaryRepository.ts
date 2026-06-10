import type {
  Beneficiary,
  PostalCodeInfo,
} from '@domain/beneficiaries/entities/Beneficiary';
import type { Result } from '@domain/shared/result';

export type BeneficiaryError =
  | { readonly type: 'unauthorized' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface BeneficiaryRepository {
  list(): Promise<Result<readonly Beneficiary[], BeneficiaryError>>;
  save(beneficiaries: readonly Beneficiary[]): Promise<Result<true, BeneficiaryError>>;
  lookupPostalCode(postalCode: string): Promise<Result<readonly PostalCodeInfo[], BeneficiaryError>>;
}
