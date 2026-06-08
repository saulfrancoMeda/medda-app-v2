import { Pressable, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { unreadCount } from '@domain/notifications/entities/Notification';
import { Logo, Text } from '@ui/design-system/components';
import { useNotifications } from '@ui/features/notifications/hooks/useNotifications';

/** Header del shell (paridad legacy): botón de menú (drawer), logo centrado y campana. */
export function AppHeader() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#FAFAF9' : '#1B1812';
  const notifications = useNotifications();
  const unread = unreadCount(notifications.data ?? []);

  const openNotifications = () =>
    // @ts-expect-error navegación anidada drawer -> tabs -> sections (igual que el DrawerContent).
    navigation.navigate('MainTabs', { screen: 'Sections', params: { screen: 'Notifications' } });

  return (
    <View className="h-14 flex-row items-center justify-between border-b border-neutral-200 bg-neutral-0 px-md dark:border-neutral-800 dark:bg-neutral-950">
      <Pressable
        hitSlop={10}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <Ionicons name="menu" size={26} color={iconColor} />
      </Pressable>
      <Logo width={82} height={40} />
      <Pressable
        hitSlop={10}
        onPress={openNotifications}
        accessibilityRole="button"
        accessibilityLabel="Notificaciones"
      >
        <Ionicons name="notifications-outline" size={24} color={iconColor} />
        {unread > 0 ? (
          <View
            className="absolute -right-1.5 -top-1.5 h-4 min-w-4 items-center justify-center rounded-pill bg-danger px-1"
          >
            <Text variant="caption" className="text-neutral-0" style={{ fontSize: 10, lineHeight: 14 }}>
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
