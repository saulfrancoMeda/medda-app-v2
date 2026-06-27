import {
  BENEFICIARY_PERCENT_OPTIONS,
  type Beneficiary,
  type BeneficiaryAddress,
  type BeneficiaryPercent,
  type PostalCodeInfo,
} from '@domain/beneficiaries/entities/Beneficiary';
import type {
  BeneficiaryError,
  BeneficiaryRepository,
} from '@domain/beneficiaries/ports/BeneficiaryRepository';
import { err, ok, type Result } from '@domain/shared/result';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';
import { isNipError } from '@infrastructure/http/apiError';

interface RawBeneficiaryAddress {
  readonly postalCode?: string;
  readonly colony?: string;
  readonly colonySelected?: string | number;
  readonly street?: string;
  readonly extNumber?: string;
  readonly intNumber?: string;
  readonly municipality?: string;
  readonly state?: string;
  readonly country?: string;
}

interface RawBeneficiary {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly lastName2?: string;
  readonly percent?: number;
  readonly birthDate?: string;
  readonly dateCreated?: string;
  readonly dateModified?: string;
  readonly address?: RawBeneficiaryAddress;
}

interface RawPostalCodeInfo {
  readonly id?: string | number;
  readonly postalCode?: string;
  readonly colony?: string;
  readonly municipality?: string;
  readonly state?: string;
  readonly city?: string;
}

const toBeneficiaryError = (e: HttpError): BeneficiaryError => {
  if (e.kind === 'network') return { type: 'network' };
  if (e.status === 401 || isNipError(e.message)) return { type: 'unauthorized' };
  return { type: 'unknown', message: e.message };
};

export class MedaBeneficiaryRepository implements BeneficiaryRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Result<readonly Beneficiary[], BeneficiaryError>> {
    const res = await this.http.request<{ beneficiaries?: RawBeneficiary[] }>(endpoints.beneficiariesList);
    if (!res.ok) return err(toBeneficiaryError(res.error));
    return ok((res.value.beneficiaries ?? []).map(toBeneficiary));
  }

  async save(beneficiaries: readonly Beneficiary[]): Promise<Result<true, BeneficiaryError>> {
    const res = await this.http.request<unknown>(endpoints.beneficiariesEdit, {
      body: { beneficiaries: beneficiaries.map(toPayload) },
    });
    if (!res.ok) return err(toBeneficiaryError(res.error));
    return ok(true);
  }

  async lookupPostalCode(postalCode: string): Promise<Result<readonly PostalCodeInfo[], BeneficiaryError>> {
    const res = await this.http.request<{ info?: RawPostalCodeInfo[] }>(endpoints.postalCodeInfo, {
      query: { postalCode },
    });
    if (!res.ok) return err(toBeneficiaryError(res.error));
    return ok((res.value.info ?? []).map(toPostalCodeInfo));
  }
}

const toBeneficiary = (raw: RawBeneficiary): Beneficiary => {
  const beneficiary: Beneficiary = {
    firstName: raw.firstName ?? '',
    lastName: raw.lastName ?? '',
    lastName2: raw.lastName2 ?? '',
    percent: toPercent(raw.percent),
    address: toAddress(raw.address),
  };
  return {
    ...beneficiary,
    ...(raw.birthDate ? { birthDate: raw.birthDate } : {}),
    ...(raw.dateCreated ? { dateCreated: raw.dateCreated } : {}),
    ...(raw.dateModified ? { dateModified: raw.dateModified } : {}),
  };
};

const toAddress = (raw?: RawBeneficiaryAddress): BeneficiaryAddress => ({
  postalCode: raw?.postalCode ?? '',
  colony: raw?.colony ?? '',
  street: raw?.street ?? '',
  extNumber: raw?.extNumber ?? '',
  intNumber: raw?.intNumber ?? '',
  colonySelected: raw?.colonySelected !== undefined ? String(raw.colonySelected) : '',
  municipality: raw?.municipality ?? '',
  state: raw?.state ?? '',
  country: raw?.country ?? 'México',
});

const toPostalCodeInfo = (raw: RawPostalCodeInfo): PostalCodeInfo => ({
  id: raw.id !== undefined ? String(raw.id) : '',
  postalCode: raw.postalCode ?? '',
  colony: raw.colony ?? '',
  municipality: raw.municipality ?? '',
  state: raw.state ?? '',
  ...(raw.city ? { city: raw.city } : {}),
});

const toPercent = (value?: number): BeneficiaryPercent =>
  BENEFICIARY_PERCENT_OPTIONS.find((option) => option === value) ?? 25;

const toPayload = (beneficiary: Beneficiary) => ({
  firstName: beneficiary.firstName,
  lastName: beneficiary.lastName,
  lastName2: beneficiary.lastName2,
  percent: beneficiary.percent,
  ...(beneficiary.birthDate ? { birthDate: beneficiary.birthDate } : {}),
  address: {
    postalCode: beneficiary.address.postalCode,
    colony: beneficiary.address.colony,
    colonySelected: beneficiary.address.colonySelected || null,
    street: beneficiary.address.street,
    extNumber: beneficiary.address.extNumber,
    intNumber: beneficiary.address.intNumber ?? '',
    municipality: beneficiary.address.municipality ?? '',
    state: beneficiary.address.state ?? '',
    country: beneficiary.address.country ?? 'México',
  },
});
