import { describe, expect, it } from '@jest/globals';
import {
  makeEmptyBeneficiaryDraft,
  validateBeneficiaries,
  validateBirthDate,
  type BeneficiaryDraft,
} from '@domain/beneficiaries/entities/Beneficiary';

const validDraft = (overrides: Partial<BeneficiaryDraft> = {}): BeneficiaryDraft => ({
  ...makeEmptyBeneficiaryDraft({
    postalCode: '03100',
    colony: 'Del Valle Centro',
    colonySelected: '1',
    street: 'Av. Insurgentes',
    extNumber: '100',
    municipality: 'Benito Juárez',
    state: 'Ciudad de México',
  }),
  firstName: 'Ana',
  lastName: 'Pérez',
  lastName2: 'López',
  percent: 100,
  birthDate: '01/01/1990',
  ...overrides,
});

describe('beneficiaries validation', () => {
  it('acepta un beneficiario completo con 100%', () => {
    const result = validateBeneficiaries([validDraft()], new Date(Date.UTC(2026, 5, 9)));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]?.firstName).toBe('Ana');
      expect(result.value[0]?.percent).toBe(100);
    }
  });

  it('exige que los porcentajes sumen 100%', () => {
    const result = validateBeneficiaries(
      [validDraft({ percent: 50 }), validDraft({ firstName: 'Luis', percent: 25 })],
      new Date(Date.UTC(2026, 5, 9)),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Completa el 100% para continuar.');
      expect(result.error.totalPercent).toBe(75);
    }
  });

  it('limita el registro a 4 beneficiarios', () => {
    const result = validateBeneficiaries(
      [
        validDraft({ firstName: 'Ana', percent: 25 }),
        validDraft({ firstName: 'Luis', percent: 25 }),
        validDraft({ firstName: 'Sofía', percent: 25 }),
        validDraft({ firstName: 'María', percent: 25 }),
        validDraft({ firstName: 'Pedro', percent: 25 }),
      ],
      new Date(Date.UTC(2026, 5, 9)),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Puedes registrar hasta 4 beneficiarios.');
    }
  });

  it('rechaza fechas fuera del rango 18-80 años', () => {
    const result = validateBeneficiaries(
      [validDraft({ birthDate: '01/01/2015' })],
      new Date(Date.UTC(2026, 5, 9)),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.errors[0]?.birthDate).toBe(
        'El beneficiario debe tener entre 18 y 80 años.',
      );
    }
  });
});

describe('validateBirthDate', () => {
  const now = new Date(Date.UTC(2026, 5, 9));

  it('acepta vacío (campo opcional) y una fecha válida en rango', () => {
    expect(validateBirthDate('', now)).toBeNull();
    expect(validateBirthDate('01/01/1990', now)).toBeNull();
  });

  it('exige la fecha completa', () => {
    expect(validateBirthDate('01/01/19', now)).toBe('Ingresa la fecha completa (DD/MM/AAAA).');
  });

  it('rechaza una fecha de calendario imposible', () => {
    expect(validateBirthDate('14/14/1990', now)).toBe('Esa fecha no existe. Revísala.');
  });

  it('rechaza una edad fuera del rango 18-80', () => {
    expect(validateBirthDate('01/01/2015', now)).toBe(
      'El beneficiario debe tener entre 18 y 80 años.',
    );
  });
});
