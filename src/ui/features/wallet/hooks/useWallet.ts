import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContainer } from '@ui/providers/ContainerProvider';

export function useInvalidateWallet() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    void queryClient.invalidateQueries({ queryKey: ['wallet', 'movements'] });
    void queryClient.invalidateQueries({ queryKey: ['wallet', 'salesTotal'] });
  };
}

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

export function useServices(categoryId: string) {
  const { walletRepository } = useContainer();
  return useQuery({
    queryKey: ['wallet', 'services', categoryId],
    queryFn: async () => {
      const res = await walletRepository.getServices(categoryId);
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
