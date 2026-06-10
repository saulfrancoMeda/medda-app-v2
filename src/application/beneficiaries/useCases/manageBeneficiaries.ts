import { err, type Result } from '@domain/shared/result';
import {
  isValidPostalCode,
  validateBeneficiaries,
  type BeneficiariesValidationError,
  type Beneficiary,
  type BeneficiaryDraft,
  type PostalCodeInfo,
} from '@domain/beneficiaries/entities/Beneficiary';
import type {
  BeneficiaryError,
  BeneficiaryRepository,
} from '@domain/beneficiaries/ports/BeneficiaryRepository';

export type SaveBeneficiariesError = BeneficiaryError | BeneficiariesValidationError;
export type LookupPostalCodeError =
  | BeneficiaryError
  | { readonly type: 'validation'; readonly message: string };

export const makeListBeneficiaries =
  ({ repository }: { readonly repository: BeneficiaryRepository }) =>
  (): Promise<Result<readonly Beneficiary[], BeneficiaryError>> =>
    repository.list();

export const makeSaveBeneficiaries =
  ({ repository }: { readonly repository: BeneficiaryRepository }) =>
  async (
    drafts: readonly BeneficiaryDraft[],
  ): Promise<Result<true, SaveBeneficiariesError>> => {
    const validation = validateBeneficiaries(drafts);
    if (!validation.ok) return err(validation.error);
    return repository.save(validation.value);
  };

export const makeLookupPostalCode =
  ({ repository }: { readonly repository: BeneficiaryRepository }) =>
  (postalCode: string): Promise<Result<readonly PostalCodeInfo[], LookupPostalCodeError>> => {
    if (!isValidPostalCode(postalCode)) {
      return Promise.resolve(err({ type: 'validation', message: 'El código postal es inválido.' }));
    }
    return repository.lookupPostalCode(postalCode);
  };
