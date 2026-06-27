export const REGISTRATION_STEPS = [
  'phone',
  'otp',
  'personal',
  'demographics',
  'document',
  'address',
  'beneficiaries',
  'survey',
  'nip',
  'legal',
] as const;

export type RegistrationStep = (typeof REGISTRATION_STEPS)[number];

export type Nationality = 'mexicana' | 'extranjera';
export type ResidentStatus = '' | 'fm' | 'passport';

export interface RegistrationAddress {
  readonly postalCode: string;
  readonly colony: string;
  readonly street: string;
  readonly extNumber: string;
  readonly intNumber: string;
  readonly municipality: string;
  readonly state: string;
  readonly colonySelected: string;
}

export interface RegistrationBeneficiary {
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2: string;
  readonly percent: number | null;
}

export interface TransactionalAnswer {
  readonly key: string;
  readonly value: string;
}

export interface RegistrationDraft {
  readonly phone: string;
  readonly phoneVerified: boolean;
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2: string;
  readonly password: string;
  readonly email: string;
  readonly birthDate: string;
  readonly gender: string;
  readonly occupation: string;
  readonly occupationLabel: string;
  readonly nationality: Nationality;
  readonly resident: ResidentStatus;
  readonly curp: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly documentType: string;
  readonly documentFrontUri: string;
  readonly documentBackUri: string;
  readonly documentExtracted: boolean;
  readonly address: RegistrationAddress;
  readonly beneficiaries: readonly RegistrationBeneficiary[];
  readonly sellsFromHome: boolean | null;
  readonly transactionalProfile: readonly TransactionalAnswer[];
  readonly nip: string;
  readonly acceptedTerms: boolean;
  readonly acceptedPrivacy: boolean;
  readonly acceptedAccountOpening: boolean;
  readonly currentStep: RegistrationStep;
}

const emptyAddress = (): RegistrationAddress => ({
  postalCode: '',
  colony: '',
  street: '',
  extNumber: '',
  intNumber: '',
  municipality: '',
  state: '',
  colonySelected: '',
});

export const makeEmptyRegistrationDraft = (): RegistrationDraft => ({
  phone: '',
  phoneVerified: false,
  firstName: '',
  lastName: '',
  lastName2: '',
  password: '',
  email: '',
  birthDate: '',
  gender: '',
  occupation: '',
  occupationLabel: '',
  nationality: 'mexicana',
  resident: '',
  curp: '',
  latitude: '0.0',
  longitude: '0.0',
  documentType: '',
  documentFrontUri: '',
  documentBackUri: '',
  documentExtracted: false,
  address: emptyAddress(),
  beneficiaries: [],
  sellsFromHome: null,
  transactionalProfile: [],
  nip: '',
  acceptedTerms: false,
  acceptedPrivacy: false,
  acceptedAccountOpening: false,
  currentStep: 'phone',
});

export const stepIndex = (step: RegistrationStep): number => REGISTRATION_STEPS.indexOf(step);

export const nextStep = (step: RegistrationStep): RegistrationStep =>
  REGISTRATION_STEPS[Math.min(stepIndex(step) + 1, REGISTRATION_STEPS.length - 1)] ?? step;

export const registrationProgress = (step: RegistrationStep): number =>
  (stepIndex(step) + 1) / REGISTRATION_STEPS.length;
