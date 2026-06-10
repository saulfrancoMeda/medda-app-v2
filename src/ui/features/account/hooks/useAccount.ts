import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@ui/providers/ContainerProvider';

export function useProfile() {
  const { accountRepository } = useContainer();
  return useQuery({
    queryKey: ['account', 'profile'],
    queryFn: async () => {
      const res = await accountRepository.getProfile();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useStatements() {
  const { accountRepository } = useContainer();
  return useQuery({
    queryKey: ['account', 'statements'],
    queryFn: async () => {
      const res = await accountRepository.listStatements();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}
