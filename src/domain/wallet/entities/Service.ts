export interface Service {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
}

export interface ServicePaymentInput {
  readonly account: string;
  readonly service: string;
  readonly amount: string;
  readonly reference: string;
  readonly nip: string;
}
