import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@ui/providers/ContainerProvider';

// Hooks de datos de billetera. Cada uno llama al WalletRepository (puerto de dominio) y
// lanza el error si el Result es err para que TanStack Query lo maneje (loading/error/data).

export function useDefaultAccount() {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'defaultAccount'],
    queryFn: async () => {
      const res = await walletRepository.getDefaultAccount();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useBalance(accountId: string | undefined) {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'balance', accountId],
    enabled: Boolean(accountId),
    queryFn: async () => {
      const res = await walletRepository.getBalance(accountId as string);
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useStpAccount() {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'stp'],
    queryFn: async () => {
      const res = await walletRepository.getStpAccount();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useSpeiBanks() {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'banks'],
    queryFn: async () => {
      const res = await walletRepository.getSpeiBanks();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useMovements(accountId: string | undefined, channels?: readonly string[]) {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'movements', accountId, channels ?? 'transactional'],
    enabled: Boolean(accountId),
    queryFn: async () => {
      const res = await walletRepository.getMovements(accountId as string, 0, channels);
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useCategories() {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'categories'],
    queryFn: async () => {
      const res = await walletRepository.getCategories();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useSalesTotal() {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'salesTotal'],
    queryFn: async () => {
      const res = await walletRepository.getSalesTotal();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}
