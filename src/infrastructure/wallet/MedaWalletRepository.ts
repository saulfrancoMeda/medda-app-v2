import { err, ok, type Result } from '@domain/shared/result';
import type { Account, StpAccount } from '@domain/wallet/entities/Account';
import type { Movement } from '@domain/wallet/entities/Movement';
import type {
  MovementsPage,
  WalletError,
  WalletRepository,
} from '@domain/wallet/ports/WalletRepository';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

interface RawAccount {
  account?: { id?: string; account?: string; active?: boolean };
}
interface RawBalance {
  balance?: number;
}
interface RawStp {
  account?: { accountNumber?: string };
}
interface RawMovement {
  id?: string;
  description?: string;
  date?: string;
  channels?: string[];
  amount?: number;
  properties?: { amount?: number; reference?: string; referenceLabel?: string };
}
interface RawMovements {
  movements?: RawMovement[];
  page?: number;
  lastPage?: number;
}

const toWalletError = (e: HttpError): WalletError => {
  if (e.kind === 'network') return { type: 'network' };
  if (e.status === 401) return { type: 'unauthorized' };
  return { type: 'unknown', message: e.message };
};

export class MedaWalletRepository implements WalletRepository {
  constructor(private readonly http: HttpClient) {}

  async getDefaultAccount(): Promise<Result<Account, WalletError>> {
    const res = await this.http.request<RawAccount>(endpoints.walletDefaultAccount, {
      query: { fullAccountInfo: true },
    });
    if (!res.ok) return err(toWalletError(res.error));
    const a = res.value.account;
    if (!a?.id) return err({ type: 'unknown', message: 'Cuenta no encontrada' });
    return ok({ id: a.id, accountNumber: a.account ?? '', active: a.active ?? false });
  }

  async getBalance(accountId: string): Promise<Result<number, WalletError>> {
    const res = await this.http.request<RawBalance>(endpoints.walletBalance, {
      body: { account: accountId },
    });
    if (!res.ok) return err(toWalletError(res.error));
    return ok(res.value.balance ?? 0);
  }

  async getStpAccount(): Promise<Result<StpAccount, WalletError>> {
    const res = await this.http.request<RawStp>(endpoints.walletStpAccount);
    if (!res.ok) return err(toWalletError(res.error));
    return ok({ clabe: res.value.account?.accountNumber ?? '' });
  }

  async getMovements(accountId: string, page: number): Promise<Result<MovementsPage, WalletError>> {
    // TODO: verificar nombre exacto de params (channels/page/limit) y shape con datos reales.
    const res = await this.http.request<RawMovements>(endpoints.walletMovements, {
      query: { account: accountId, channels: 'transactional', page },
    });
    if (!res.ok) return err(toWalletError(res.error));
    const movements: Movement[] = (res.value.movements ?? []).map((m) => ({
      id: m.id ?? '',
      description: m.description ?? '',
      date: m.date ?? '',
      channels: m.channels ?? [],
      amount: m.properties?.amount ?? m.amount ?? 0,
      reference: m.properties?.reference,
      referenceLabel: m.properties?.referenceLabel,
    }));
    return ok({ movements, page: res.value.page ?? page, lastPage: res.value.lastPage ?? page });
  }
}
