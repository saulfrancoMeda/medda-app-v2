import type { Result } from '@domain/shared/result';
import type { Account, StpAccount } from '@domain/wallet/entities/Account';
import type { Movement } from '@domain/wallet/entities/Movement';
import type {
  Bank,
  MedaTransferInput,
  SpeiSendInput,
  TransactionResult,
} from '@domain/wallet/entities/Transfer';
import type { Category } from '@domain/wallet/entities/Category';
import type { Service, ServicePaymentInput } from '@domain/wallet/entities/Service';

export type WalletError =
  | { readonly type: 'unauthorized' }
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface MovementsPage {
  readonly movements: readonly Movement[];
  readonly page: number;
  readonly lastPage: number;
}

export interface WalletRepository {
  getDefaultAccount(): Promise<Result<Account, WalletError>>;
  getBalance(accountId: string): Promise<Result<number, WalletError>>;
  getStpAccount(): Promise<Result<StpAccount, WalletError>>;
  getMovements(
    accountId: string,
    page: number,
    channels?: readonly string[],
  ): Promise<Result<MovementsPage, WalletError>>;
  getCategories(): Promise<Result<readonly Category[], WalletError>>;
  getSalesTotal(): Promise<Result<number, WalletError>>;
  getServices(categoryId: string): Promise<Result<readonly Service[], WalletError>>;
  payService(input: ServicePaymentInput): Promise<Result<TransactionResult, WalletError>>;
  getSpeiBanks(): Promise<Result<readonly Bank[], WalletError>>;
  validateNip(nip: string): Promise<Result<true, WalletError>>;
  sendSpei(input: SpeiSendInput): Promise<Result<TransactionResult, WalletError>>;
  transferToUser(input: MedaTransferInput): Promise<Result<TransactionResult, WalletError>>;
}
