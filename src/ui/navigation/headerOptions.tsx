import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import { unreadCount } from '@domain/notifications/entities/Notification';
import { useNotifications } from '@ui/features/notifications/hooks/useNotifications';
import { Text } from '@ui/design-system/components';
import { palette } from '@ui/design-system/tokens/palette';

function HeaderBackButton({ tint }: { tint: string }) {
  const navigation = useNavigation();
  if (!navigation.canGoBack()) return null;
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Atrás"
      android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true, radius: 22 }}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 4 })}
    >
      <View className="h-10 w-10 items-center justify-center">
        <Ionicons name="chevron-back" size={26} color={tint} />
      </View>
    </Pressable>
  );
}

function NotificationHeaderButton({ tint }: { tint: string }) {
  const navigation = useNavigation();
  const notifications = useNotifications();
  const unread = unreadCount(notifications.data ?? []);

  const openNotifications = () =>
    // @ts-expect-error navegación anidada drawer -> tabs -> sections
    navigation.navigate('MainTabs', { screen: 'Sections', params: { screen: 'Notifications' } });

  return (
    <Pressable
      hitSlop={10}
      onPress={openNotifications}
      accessibilityRole="button"
      accessibilityLabel="Notificaciones"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 6, paddingRight: 10 })}
    >
      <Ionicons name="notifications-outline" size={24} color={tint} />
      {unread > 0 ? (
        <View
          className="absolute items-center justify-center rounded-pill bg-danger"
          style={{
            top: -4,
            right: 6,
            minWidth: 16,
            height: 16,
            paddingHorizontal: 3,
            borderWidth: 1.5,
          }}
        >
          <Text className="text-neutral-0" style={{ fontSize: 10, lineHeight: 12, fontWeight: '700' }}>
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function useStackScreenOptions(opts?: { showBell?: boolean }): NativeStackNavigationOptions {
  const showBell = opts?.showBell === true;
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const tint = dark ? palette.neutral[50] : palette.neutral[900];
  const bg = dark ? palette.neutral[950] : palette.neutral[0];
  return {
    headerTintColor: tint,
    headerTitleAlign: 'center',
    headerTitleStyle: { color: tint, fontWeight: '700', fontSize: 18 },
    headerStyle: { backgroundColor: bg },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    headerBackButtonMenuEnabled: false,
    headerLeft: ({ tintColor }) => <HeaderBackButton tint={tintColor ?? tint} />,
    headerRight: showBell
      ? ({ tintColor }) => <NotificationHeaderButton tint={tintColor ?? tint} />
      : undefined,
  };
}
