import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { unreadCount } from '@domain/notifications/entities/Notification';
import { Logo, Text } from '@ui/design-system/components';
import { useNotifications } from '@ui/features/notifications/hooks/useNotifications';
import { palette } from '@ui/design-system/tokens/palette';

export interface GradientHeaderRowProps {
  readonly onMenuPress: () => void;
  readonly onNotificationsPress: () => void;
  readonly unread?: number;
}

export function GradientHeaderRow({
  onMenuPress,
  onNotificationsPress,
  unread = 0,
}: GradientHeaderRowProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
      <Pressable
        hitSlop={10}
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <Ionicons name="menu" size={26} color={palette.neutral[900]} />
      </Pressable>
      <Logo width={70} height={28} />
      <View style={{ width: 36, alignItems: 'flex-end' }}>
        <Pressable
          hitSlop={10}
          onPress={onNotificationsPress}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
        >
          <Ionicons name="notifications-outline" size={26} color={palette.neutral[900]} />
          {unread > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -6,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 3,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: palette.brand[500],
                backgroundColor: palette.danger,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{ fontSize: 9, lineHeight: 11, fontWeight: '800', color: 'white' }}
              >
                {unread > 9 ? '9+' : String(unread)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

export function AppHeader() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? palette.neutral[50] : palette.neutral[900];
  const notifications = useNotifications();
  const unread = unreadCount(notifications.data ?? []);

  const openNotifications = () =>
    // @ts-expect-error navegación anidada drawer -> tabs -> sections (igual que el DrawerContent).
    navigation.navigate('MainTabs', { screen: 'Sections', params: { screen: 'Notifications' } });

  return (
    <View className="border-b border-neutral-200 bg-neutral-0 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Spacer explícito para la barra de estado / cámara punch-hole */}
      <View style={{ height: top }} />
      <View className="h-14 flex-row items-center justify-between px-md">
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
                borderColor: colorScheme === 'dark' ? palette.neutral[950] : palette.neutral[0],
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
    </View>
  );
}
