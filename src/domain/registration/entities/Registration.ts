// Registration draft: everything collected across the onboarding steps. It is persisted so a user
// who leaves can resume on the step they left. Mirrors the legacy `onboarding_state` cache.

export const REGISTRATION_STEPS = [
  'phone',
  'otp',
  'personal',
  'demographics',
  'address',
  'beneficiaries',
  'nip',
  'legal',
] as const;

export type RegistrationStep = (typeof REGISTRATION_STEPS)[number];

export interface RegistrationDraft {
  readonly phone: string;
  readonly phoneVerified: boolean;
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2: string;
  readonly password: string;
  readonly email: string;
  readonly birthDate: string; // DD/MM/AAAA
  readonly curp: string;
  readonly nip: string;
  readonly acceptedTerms: boolean;
  readonly acceptedPrivacy: boolean;
  readonly acceptedAccountOpening: boolean;
  readonly currentStep: RegistrationStep;
}

export const makeEmptyRegistrationDraft = (): RegistrationDraft => ({
  phone: '',
  phoneVerified: false,
  firstName: '',
  lastName: '',
  lastName2: '',
  password: '',
  email: '',
  birthDate: '',
  curp: '',
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
