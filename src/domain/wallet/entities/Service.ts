/** Servicio/operador a pagar (/wallet/services/list). */
export interface Service {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
}

/** Datos para procesar el pago de un servicio (/wallet/services/payments/process). */
export interface ServicePaymentInput {
  readonly account: string;
  readonly service: string;
  readonly amount: string;
  readonly reference: string;
  readonly nip: string;
}
