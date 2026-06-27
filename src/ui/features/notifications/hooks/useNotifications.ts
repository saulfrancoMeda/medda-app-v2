import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContainer } from '@ui/providers/ContainerProvider';

const NOTIFICATIONS_KEY = ['notifications', 'list'] as const;

export function useNotifications() {
  const { notificationRepository } = useContainer();
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const res = await notificationRepository.list();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useMarkNotificationRead() {
  const { notificationRepository } = useContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await notificationRepository.markAsRead(id);
      if (!res.ok) throw res.error;
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
