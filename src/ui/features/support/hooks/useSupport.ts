import { useQuery } from '@tanstack/react-query';
import { useContainer } from '@ui/providers/ContainerProvider';

export function useFaqs() {
  const { supportRepository } = useContainer();
  return useQuery({
    queryKey: ['support', 'faqs'],
    queryFn: async () => {
      const res = await supportRepository.getFaqs();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}
