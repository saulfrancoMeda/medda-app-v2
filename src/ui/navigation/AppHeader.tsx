import { Pressable, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Logo } from '@ui/design-system/components';

/** Header del shell (paridad legacy): botón de menú (drawer), logo centrado y campana. */
export function AppHeader() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f9fafb' : '#0a0f14';

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
      <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Notificaciones">
        <Ionicons name="notifications-outline" size={24} color={iconColor} />
      </Pressable>
    </View>
  );
}
