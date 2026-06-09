import { Pressable, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { unreadCount } from '@domain/notifications/entities/Notification';
import { Logo, Text } from '@ui/design-system/components';
import { useNotifications } from '@ui/features/notifications/hooks/useNotifications';

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
        <Ionicons name="notifications-outline" size={26} color={iconColor} />
        {unread > 0 ? (
          <View
            className="absolute items-center justify-center rounded-pill bg-danger"
            style={{
              top: -6,
              right: -8,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              borderWidth: 2,
              borderColor: colorScheme === 'dark' ? '#131110' : '#ffffff',
            }}
          >
            <Text
              className="text-neutral-0"
              style={{ fontSize: 11, lineHeight: 13, fontWeight: '700' }}
            >
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
