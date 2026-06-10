export interface Bank {
  readonly code: string;
  readonly name: string;
}

export interface SpeiSendInput {
  readonly cuentaBeneficiario: string;
  readonly institucionContraparte: string;
  readonly nombreBeneficiario: string;
  readonly emailBeneficiario?: string;
  readonly monto: string;
  readonly comment?: string;
  readonly nip: string;
  readonly location: { readonly latitude: number; readonly longitude: number };
}

export interface MedaTransferInput {
  readonly originAccount: string;
  readonly resource: string;
  readonly amount: string;
  readonly nip: string;
  readonly comment?: string;
}

export interface TransactionResult {
  readonly id: string;
  readonly claveRastreo?: string;
  readonly date?: string;
}

export const isValidClabe = (clabe: string): boolean => /^[0-9]{18}$/.test(clabe);

export const findBankByClabe = (
  banks: readonly Bank[],
  clabe: string,
): Bank | undefined => {
  if (clabe.length < 3) return undefined;
  const code = clabe.slice(0, 3);
  return banks.find((b) => b.code === code || b.code.endsWith(code) || b.code === `40${code}`);
};

export const isValidNip = (nip: string): boolean => /^[0-9]{6}$/.test(nip);

export const isValidAmount = (amount: string): boolean =>
  /^\d*\.?\d{1,2}$/.test(amount) && Number(amount) > 0;
