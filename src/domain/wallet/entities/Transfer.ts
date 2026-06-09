/** Banco para SPEI (/wallet/stp/banks): code = institucionContraparte. */
export interface Bank {
  readonly code: string;
  readonly name: string;
}

/** Datos para enviar un SPEI a terceros (/wallet/transactions/spei/send). Paridad con el legacy. */
export interface SpeiSendInput {
  readonly cuentaBeneficiario: string; // CLABE 18 dígitos
  readonly institucionContraparte: string; // code del banco
  readonly nombreBeneficiario: string;
  readonly emailBeneficiario?: string;
  readonly monto: string; // "100.00"
  readonly comment?: string;
  readonly nip: string; // 6 dígitos (texto plano, como el legacy)
  readonly location: { readonly latitude: number; readonly longitude: number };
}

/** Datos para transferir a un usuario Medá (/wallet/accounts/transfer/toResource). */
export interface MedaTransferInput {
  readonly originAccount: string;
  readonly resource: string; // identificador del destinatario (del QR escaneado)
  readonly amount: string;
  readonly nip: string;
  readonly comment?: string;
}

/** Resultado de una transacción de envío. */
export interface TransactionResult {
  readonly id: string;
  readonly claveRastreo?: string;
  readonly date?: string;
}

/** CLABE válida = 18 dígitos. */
export const isValidClabe = (clabe: string): boolean => /^[0-9]{18}$/.test(clabe);

/** Banco de una CLABE: los primeros 3 dígitos son el código de institución (catálogo Banxico). */
export const findBankByClabe = (
  banks: readonly Bank[],
  clabe: string,
): Bank | undefined => {
  if (clabe.length < 3) return undefined;
  const code = clabe.slice(0, 3);
  return banks.find((b) => b.code === code || b.code.endsWith(code) || b.code === `40${code}`);
};

/** NIP válido = 6 dígitos. */
export const isValidNip = (nip: string): boolean => /^[0-9]{6}$/.test(nip);

/** Monto válido = número con hasta 2 decimales y > 0. */
export const isValidAmount = (amount: string): boolean =>
  /^\d*\.?\d{1,2}$/.test(amount) && Number(amount) > 0;
