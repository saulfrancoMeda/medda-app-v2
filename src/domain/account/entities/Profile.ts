export interface HomeAddress {
  readonly street?: string;
  readonly colony?: string;
  readonly postalCode?: string;
  readonly reference?: string;
}

/** Perfil del usuario (/user/profile). Subconjunto fiel al legacy (Account.js). */
export interface UserProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2?: string;
  readonly email?: string;
  readonly cellphone?: string;
  readonly phone?: string;
  readonly birthDate?: string;
  readonly rfc?: string;
  readonly curp?: string;
  readonly lastLogin?: string;
  readonly homeAddress?: HomeAddress;
}

/** Estado de cuenta (/account-statements/list). */
export interface AccountStatement {
  readonly id: string;
  readonly from: string;
  readonly to: string;
}

export const fullName = (p: UserProfile): string =>
  [p.firstName, p.lastName, p.lastName2].filter(Boolean).join(' ').trim();

/** Beneficiario (/beneficiaries/list). */
export interface Beneficiary {
  readonly firstName: string;
  readonly lastName: string;
  readonly lastName2?: string;
  readonly percent?: number;
  readonly birthDate?: string;
}

export const beneficiaryName = (b: Beneficiary): string =>
  [b.firstName, b.lastName, b.lastName2].filter(Boolean).join(' ').trim();
