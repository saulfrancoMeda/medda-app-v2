import { describe, expect, it } from '@jest/globals';
import { ok } from '@domain/shared/result';
import { makeEmptyBeneficiaryDraft } from '@domain/beneficiaries/entities/Beneficiary';
import type { BeneficiaryRepository } from '@domain/beneficiaries/ports/BeneficiaryRepository';
import {
  makeLookupPostalCode,
  makeSaveBeneficiaries,
} from '@application/beneficiaries/useCases/manageBeneficiaries';

const makeRepository = () => {
  const saved: unknown[] = [];
  const repository: BeneficiaryRepository = {
    list: async () => ok([]),
    save: async (beneficiaries) => {
      saved.push(beneficiaries);
      return ok(true);
    },
    lookupPostalCode: async () => ok([]),
  };
  return { repository, saved };
};

const validDraft = () => ({
  ...makeEmptyBeneficiaryDraft({
    postalCode: '03100',
    colony: 'Del Valle Centro',
    street: 'Av. Insurgentes',
    extNumber: '100',
  }),
  firstName: 'Ana',
  lastName: 'Pérez',
  lastName2: 'López',
  percent: 100,
});

describe('beneficiary use cases', () => {
  it('valida antes de guardar', async () => {
    const { repository, saved } = makeRepository();
    const save = makeSaveBeneficiaries({ repository });

    const result = await save([validDraft()]);

    expect(result.ok).toBe(true);
    expect(saved).toHaveLength(1);
  });

  it('no llama al repositorio si el total no suma 100', async () => {
    const { repository, saved } = makeRepository();
    const save = makeSaveBeneficiaries({ repository });

    const result = await save([validDraft(), { ...validDraft(), firstName: 'Luis', percent: 25 }]);

    expect(result.ok).toBe(false);
    expect(saved).toHaveLength(0);
  });

  it('valida el codigo postal antes de consultar colonias', async () => {
    const { repository } = makeRepository();
    const lookup = makeLookupPostalCode({ repository });

    const result = await lookup('123');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('validation');
    }
  });
});
