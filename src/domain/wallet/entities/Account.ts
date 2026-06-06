/** Cuenta de billetera del legacy (/wallet/accounts/default). */
export interface Account {
  readonly id: string;
  readonly accountNumber: string;
  readonly active: boolean;
}

/** Cuenta STP (CLABE) del legacy (/wallet/stp/account). */
export interface StpAccount {
  readonly clabe: string;
}
