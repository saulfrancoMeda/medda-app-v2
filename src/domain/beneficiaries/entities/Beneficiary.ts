import { err, ok, type Result } from '@domain/shared/result';

export const BENEFICIARY_PERCENT_OPTIONS = [100, 75, 50, 25] as const;
export type BeneficiaryPercent = (typeof BENEFICIARY_PERCENT_OPTIONS)[number];

export interface BeneficiaryAddress {
  readonly postalCode: string;
  readonly colony: string;
  readonly street: string;
  readonly extNumber: string;
  readonly intNumber?: string;
  readonly colonySelected?: string;
  readonly municipality?: string;
  readonly state?: string;
  readonly country?: string;
}

export interface Beneficiary {
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2: string;
  readonly percent: BeneficiaryPercent;
  readonly address: BeneficiaryAddress;
  readonly birthDate?: string;
  readonly dateCreated?: string;
  readonly dateModified?: string;
}

export interface PostalCodeInfo {
  readonly id: string;
  readonly postalCode: string;
  readonly colony: string;
  readonly municipality: string;
  readonly state: string;
  readonly city?: string;
}

export interface BeneficiaryDraft {
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2: string;
  readonly percent: number | null;
  readonly birthDate: string;
  readonly address: BeneficiaryAddress;
}

export type BeneficiaryField =
  | 'firstName'
  | 'lastName'
  | 'lastName2'
  | 'percent'
  | 'birthDate'
  | 'postalCode'
  | 'colony'
  | 'street'
  | 'extNumber';

export type BeneficiaryFieldErrors = Partial<Record<BeneficiaryField, string>>;

export interface BeneficiariesValidationError {
  readonly type: 'validation';
  readonly message: string;
  readonly totalPercent: number;
  readonly errors: readonly BeneficiaryFieldErrors[];
}

const NAME_RE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ.\s]{2,}$/;
const POSTAL_CODE_RE = /^\d{5}$/;

const clean = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const isValidPostalCode = (postalCode: string): boolean => POSTAL_CODE_RE.test(postalCode);

export const isBeneficiaryPercent = (value: number | null): value is BeneficiaryPercent =>
  BENEFICIARY_PERCENT_OPTIONS.some((option) => option === value);

export const makeEmptyBeneficiaryDraft = (
  address: Partial<BeneficiaryAddress> = {},
): BeneficiaryDraft => ({
  firstName: '',
  lastName: '',
  lastName2: '',
  percent: null,
  birthDate: '',
  address: {
    postalCode: address.postalCode ?? '',
    colony: address.colony ?? '',
    street: address.street ?? '',
    extNumber: address.extNumber ?? '',
    intNumber: address.intNumber ?? '',
    colonySelected: address.colonySelected ?? '',
    municipality: address.municipality ?? '',
    state: address.state ?? '',
    country: address.country ?? 'México',
  },
});

export const beneficiaryToDraft = (beneficiary: Beneficiary): BeneficiaryDraft => ({
  firstName: beneficiary.firstName,
  lastName: beneficiary.lastName,
  lastName2: beneficiary.lastName2,
  percent: beneficiary.percent,
  birthDate: beneficiary.birthDate ? formatBeneficiaryDate(beneficiary.birthDate) : '',
  address: {
    postalCode: beneficiary.address.postalCode,
    colony: beneficiary.address.colony,
    street: beneficiary.address.street,
    extNumber: beneficiary.address.extNumber,
    intNumber: beneficiary.address.intNumber ?? '',
    colonySelected: beneficiary.address.colonySelected ?? '',
    municipality: beneficiary.address.municipality ?? '',
    state: beneficiary.address.state ?? '',
    country: beneficiary.address.country ?? 'México',
  },
});

export const beneficiariesToDrafts = (beneficiaries: readonly Beneficiary[]): BeneficiaryDraft[] =>
  beneficiaries.map(beneficiaryToDraft);

export const fullBeneficiaryName = (
  beneficiary: Pick<Beneficiary, 'firstName' | 'lastName' | 'lastName2'>,
): string =>
  [beneficiary.firstName, beneficiary.lastName, beneficiary.lastName2].filter(Boolean).join(' ');

export const formatBeneficiaryAddress = (address: BeneficiaryAddress): string =>
  [
    address.street,
    address.extNumber ? `Ext ${address.extNumber}` : '',
    address.intNumber ? `Int. ${address.intNumber}` : '',
    address.postalCode ? `C.P. ${address.postalCode}` : '',
    address.colony,
    address.municipality,
    address.state,
  ]
    .filter(Boolean)
    .join(' ');

export const formatBeneficiaryDate = (value: string): string => {
  const parsed = parseDate(value);
  if (!parsed) return value;
  return `${pad(parsed.day)}/${pad(parsed.month)}/${parsed.year}`;
};

// Birth date is optional; when present it must be a real calendar date for someone aged 18–80.
// Returns a specific message so the UI can give inline feedback, or null when the value is acceptable.
export const validateBirthDate = (value: string, now: Date = new Date()): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.replace(/\D/g, '').length < 8) return 'Ingresa la fecha completa (DD/MM/AAAA).';
  if (!parseDate(trimmed)) return 'Esa fecha no existe. Revísala.';
  if (!isAllowedBirthDate(trimmed, now)) return 'El beneficiario debe tener entre 18 y 80 años.';
  return null;
};

export const latestBeneficiaryUpdate = (
  beneficiaries: readonly Pick<Beneficiary, 'dateCreated' | 'dateModified'>[],
): string | null => {
  let latest = 0;
  for (const beneficiary of beneficiaries) {
    const candidate = toTimestamp(beneficiary.dateModified ?? beneficiary.dateCreated);
    if (candidate > latest) latest = candidate;
  }
  return latest > 0 ? new Date(latest).toISOString() : null;
};

export const validateBeneficiaries = (
  drafts: readonly BeneficiaryDraft[],
  now: Date = new Date(),
): Result<readonly Beneficiary[], BeneficiariesValidationError> => {
  const errors = drafts.map(validateBeneficiaryDraft(drafts.length, now));
  const totalPercent = drafts.reduce((sum, draft) => sum + (draft.percent ?? 0), 0);
  const hasFieldErrors = errors.some((fields) => Object.keys(fields).length > 0);

  let message = '';
  if (drafts.length === 0) {
    message = 'Añade al menos un beneficiario para guardar tus cambios.';
  } else if (drafts.length > 4) {
    message = 'Puedes registrar hasta 4 beneficiarios.';
  } else if (!hasFieldErrors && totalPercent !== 100) {
    message = 'Completa el 100% para continuar.';
  } else if (hasFieldErrors) {
    message = 'Revisa los datos de tus beneficiarios.';
  }

  if (message) {
    return err({ type: 'validation', message, totalPercent, errors });
  }

  return ok(drafts.map(normalizeBeneficiary));
};

const validateBeneficiaryDraft =
  (totalBeneficiaries: number, now: Date) =>
  (draft: BeneficiaryDraft): BeneficiaryFieldErrors => {
    const errors: BeneficiaryFieldErrors = {};
    if (!NAME_RE.test(clean(draft.firstName))) {
      errors.firstName = 'El nombre es inválido.';
    }
    if (!NAME_RE.test(clean(draft.lastName))) {
      errors.lastName = 'Dato inválido.';
    }
    if (draft.lastName2.length > 0 && !NAME_RE.test(clean(draft.lastName2))) {
      errors.lastName2 = 'Dato inválido.';
    }
    if (!isValidPostalCode(draft.address.postalCode)) {
      errors.postalCode = 'El código postal es inválido.';
    }
    if (!clean(draft.address.colony)) {
      errors.colony = 'Selecciona una colonia.';
    }
    if (clean(draft.address.street).length < 3) {
      errors.street = 'El domicilio es inválido.';
    }
    if (!clean(draft.address.extNumber)) {
      errors.extNumber = 'Dato inválido.';
    }
    if (!isBeneficiaryPercent(draft.percent)) {
      errors.percent = 'Selecciona un porcentaje.';
    } else if (totalBeneficiaries > 1 && draft.percent === 100) {
      errors.percent = 'El 100% solo puede asignarse a un beneficiario.';
    }
    const birthDateError = validateBirthDate(draft.birthDate, now);
    if (birthDateError) {
      errors.birthDate = birthDateError;
    }
    return errors;
  };

const normalizeBeneficiary = (draft: BeneficiaryDraft): Beneficiary => {
  const beneficiary: Beneficiary = {
    firstName: clean(draft.firstName),
    lastName: clean(draft.lastName),
    lastName2: clean(draft.lastName2),
    percent: draft.percent as BeneficiaryPercent,
    address: {
      postalCode: clean(draft.address.postalCode),
      colony: clean(draft.address.colony),
      street: clean(draft.address.street),
      extNumber: clean(draft.address.extNumber),
      intNumber: clean(draft.address.intNumber ?? ''),
      colonySelected: clean(draft.address.colonySelected ?? ''),
      municipality: clean(draft.address.municipality ?? ''),
      state: clean(draft.address.state ?? ''),
      country: clean(draft.address.country ?? 'México') || 'México',
    },
  };
  if (!draft.birthDate) return beneficiary;
  return { ...beneficiary, birthDate: formatBeneficiaryDate(draft.birthDate) };
};

const isAllowedBirthDate = (value: string, now: Date): boolean => {
  const parsed = parseDate(value);
  if (!parsed) return false;
  const birthday = utcDate(parsed.year, parsed.month, parsed.day);
  const min = subtractYears(now, 80);
  const max = subtractYears(now, 18);
  return birthday.getTime() >= min.getTime() && birthday.getTime() <= max.getTime();
};

const parseDate = (
  value: string,
): { readonly day: number; readonly month: number; readonly year: number } | null => {
  const trimmed = value.trim();
  const ddmmyyyy = /^(\d{2})[/-](\d{2})[/-](\d{4})/.exec(trimmed);
  if (ddmmyyyy) {
    return validDate(Number(ddmmyyyy[3]), Number(ddmmyyyy[2]), Number(ddmmyyyy[1]));
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) {
    return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }
  return null;
};

const validDate = (
  year: number,
  month: number,
  day: number,
): { readonly day: number; readonly month: number; readonly year: number } | null => {
  const date = utcDate(year, month, day);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { day, month, year };
};

const subtractYears = (date: Date, years: number): Date => {
  const result = new Date(
    Date.UTC(date.getUTCFullYear() - years, date.getUTCMonth(), date.getUTCDate()),
  );
  if (result.getUTCMonth() !== date.getUTCMonth()) {
    result.setUTCDate(0);
  }
  return result;
};

const utcDate = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day));

const toTimestamp = (value?: string): number => {
  if (!value) return 0;
  const parsed = parseDate(value);
  if (parsed) return utcDate(parsed.year, parsed.month, parsed.day).getTime();
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const pad = (value: number): string => String(value).padStart(2, '0');
