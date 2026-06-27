import { err, ok, type Result } from '@domain/shared/result';
import type { Account, StpAccount } from '@domain/wallet/entities/Account';
import type { Movement } from '@domain/wallet/entities/Movement';
import type {
  MovementsPage,
  WalletError,
  WalletRepository,
} from '@domain/wallet/ports/WalletRepository';
import type {
  Bank,
  MedaTransferInput,
  SpeiSendInput,
  TransactionResult,
} from '@domain/wallet/entities/Transfer';
import type { Category } from '@domain/wallet/entities/Category';
import type { Service, ServicePaymentInput } from '@domain/wallet/entities/Service';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';
import { isNipError } from '@infrastructure/http/apiError';

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
  properties?: {
    amount?: number;
    reference?: string;
    referenceLabel?: string;
    commission?: number;
    provider?: string;
    destinyAccount?: string;
    claveRastreo?: string;
    beneficiaryName?: string;
    beneficiaryEmail?: string;
    comments?: string;
    state?: string;
  };
}
interface RawMovements {
  movements?: RawMovement[];
  page?: number;
  lastPage?: number;
}

const toWalletError = (e: HttpError): WalletError => {
  if (e.kind === 'network') return { type: 'network' };
  if (e.status === 401 || isNipError(e.message)) return { type: 'unauthorized' };
  return { type: 'unknown', message: e.message };
};

export class MedaWalletRepository implements WalletRepository {
  constructor(private readonly http: HttpClient) { }

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

  async getMovements(
    accountId: string,
    page: number,
    channels: readonly string[] = ['transactional'],
  ): Promise<Result<MovementsPage, WalletError>> {
    const res = await this.http.request<RawMovements>(endpoints.walletMovements, {
      query: { account: accountId, channels: channels.join(','), page },
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
      commission: m.properties?.commission,
      provider: m.properties?.provider,
      destinyAccount: m.properties?.destinyAccount,
      claveRastreo: m.properties?.claveRastreo,
      beneficiaryName: m.properties?.beneficiaryName,
      beneficiaryEmail: m.properties?.beneficiaryEmail,
      comments: m.properties?.comments,
      state: m.properties?.state,
    }));
    return ok({ movements, page: res.value.page ?? page, lastPage: res.value.lastPage ?? page });
  }

  async getSpeiBanks(): Promise<Result<readonly Bank[], WalletError>> {
    const res = await this.http.request<{ banks?: Record<string, unknown> }>(
      endpoints.walletStpBanks,
    );
    if (!res.ok) return err(toWalletError(res.error));
    const raw = (res.value.banks ?? res.value) as Record<string, unknown>;
    const banks: Bank[] = Object.entries(raw)
      .filter(([, name]) => typeof name === 'string')
      .map(([code, name]) => ({ code, name: String(name) }));
    return ok(banks);
  }

  async validateNip(nip: string): Promise<Result<true, WalletError>> {
    const res = await this.http.request<unknown>(endpoints.nipValidate, { body: { nip } });
    if (!res.ok) return err(toWalletError(res.error));
    return ok(true);
  }

  async getCategories(): Promise<Result<readonly Category[], WalletError>> {
    const res = await this.http.request<{
      categories?: { id?: string; name?: string; image?: string; properties?: { color?: string } }[];
    }>(endpoints.walletCategories);
    if (!res.ok) return err(toWalletError(res.error));
    const categories: Category[] = (res.value.categories ?? []).map((c) => ({
      id: c.id ?? '',
      name: c.name ?? '',
      image: c.image,
      color: c.properties?.color,
    }));
    return ok(categories);
  }

  async getSalesTotal(): Promise<Result<number, WalletError>> {
    const res = await this.http.request<{ total?: number }>(endpoints.salesTotal);
    if (!res.ok) return err(toWalletError(res.error));
    return ok(res.value.total ?? 0);
  }

  async getServices(categoryId: string): Promise<Result<readonly Service[], WalletError>> {
    const res = await this.http.request<{
      services?: { id?: string; name?: string; image?: string }[];
    }>(endpoints.walletServices, { query: { category: categoryId } });
    if (!res.ok) return err(toWalletError(res.error));
    const services: Service[] = (res.value.services ?? []).map((s) => ({
      id: s.id ?? '',
      name: s.name ?? '',
      image: s.image,
    }));
    return ok(services);
  }

  async payService(input: ServicePaymentInput): Promise<Result<TransactionResult, WalletError>> {
    const res = await this.http.request<{ id?: string; date?: string }>(
      endpoints.servicePaymentProcess,
      { body: input },
    );
    if (!res.ok) return err(toWalletError(res.error));
    return ok({ id: res.value.id ?? '', date: res.value.date });
  }

  async sendSpei(input: SpeiSendInput): Promise<Result<TransactionResult, WalletError>> {
    const res = await this.http.request<{
      id?: string;
      date?: string;
      properties?: { claveRastreo?: string };
    }>(endpoints.walletSpeiSend, {
      body: {
        cuentaBeneficiario: input.cuentaBeneficiario,
        institucionContraparte: input.institucionContraparte,
        nombreBeneficiario: input.nombreBeneficiario,
        emailBeneficiario: input.emailBeneficiario ?? '',
        monto: input.monto,
        comment: input.comment ?? '',
        nip: input.nip,
        location: input.location,
      },
    });
    if (!res.ok) return err(toWalletError(res.error));
    return ok({
      id: res.value.id ?? '',
      claveRastreo: res.value.properties?.claveRastreo,
      date: res.value.date,
    });
  }

  async transferToUser(input: MedaTransferInput): Promise<Result<TransactionResult, WalletError>> {
    const res = await this.http.request<{ id?: string; date?: string }>(
      endpoints.walletTransferToResource,
      {
        body: {
          origin: input.originAccount,
          resource: input.resource,
          amount: input.amount,
          nip: input.nip,
          comment: input.comment,
        },
      },
    );
    if (!res.ok) return err(toWalletError(res.error));
    return ok({ id: res.value.id ?? '', date: res.value.date });
  }
}
