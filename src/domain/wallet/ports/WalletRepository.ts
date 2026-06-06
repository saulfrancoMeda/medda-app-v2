import type { Result } from '@domain/shared/result';
import type { Account, StpAccount } from '@domain/wallet/entities/Account';
import type { Movement } from '@domain/wallet/entities/Movement';

export type WalletError =
  | { readonly type: 'unauthorized' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface MovementsPage {
  readonly movements: readonly Movement[];
  readonly page: number;
  readonly lastPage: number;
}

/** Puerto de datos de billetera. La infraestructura lo implementa contra el backend Medá. */
export interface WalletRepository {
  getDefaultAccount(): Promise<Result<Account, WalletError>>;
  getBalance(accountId: string): Promise<Result<number, WalletError>>;
  getStpAccount(): Promise<Result<StpAccount, WalletError>>;
  getMovements(accountId: string, page: number): Promise<Result<MovementsPage, WalletError>>;
}
