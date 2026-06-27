import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNotification } from '@domain/notifications/entities/Notification';
import { Text } from '@ui/design-system/components';
import { useMarkNotificationRead, useNotifications } from '@ui/features/notifications/hooks/useNotifications';

const formatDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row gap-md border-b border-neutral-100 px-lg py-md dark:border-neutral-800"
    >
      <View className="pt-xs">
        <View
          className={`h-2.5 w-2.5 rounded-full ${item.read ? 'bg-neutral-300' : 'bg-brand-500'}`}
        />
      </View>
      <View className="flex-1 gap-xs">
        <Text variant="body" className={item.read ? 'font-normal' : 'font-semibold'}>
          {item.subject ?? item.message}
        </Text>
        {item.subject ? (
          <Text variant="caption" tone="muted">
            {item.message}
          </Text>
        ) : null}
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: 140, borderRadius: 14, marginTop: 4 }}
            resizeMode="cover"
          />
        ) : null}
        {item.dateCreated ? (
          <Text variant="caption" tone="muted">
            {formatDate(item.dateCreated)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function NotificationsScreen() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();

  if (notifications.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator color="#FCD535" />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-neutral-0 dark:bg-neutral-950"
      data={notifications.data ?? []}
      keyExtractor={(n) => n.id}
      refreshControl={
        <RefreshControl
          refreshing={notifications.isFetching}
          onRefresh={() => void notifications.refetch()}
          tintColor="#97720A"
        />
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center gap-md p-2xl">
          <View className="h-20 w-20 items-center justify-center rounded-pill bg-brand-100">
            <Ionicons name="notifications-outline" size={36} color="#97720A" />
          </View>
          <Text variant="h2" center>
            Sin notificaciones
          </Text>
          <Text variant="body" tone="muted" center>
            {notifications.isError
              ? 'No pudimos cargar tus notificaciones.'
              : 'Aquí verás los avisos y novedades de tu cuenta.'}
          </Text>
        </View>
      }
      contentContainerClassName="grow"
      renderItem={({ item }) => (
        <NotificationRow
          item={item}
          onPress={() => {
            if (!item.read) markRead.mutate(item.id);
          }}
        />
      )}
    />
  );
}
