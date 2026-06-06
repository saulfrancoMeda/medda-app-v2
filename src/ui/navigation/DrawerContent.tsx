import { Pressable, View } from 'react-native';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { config } from '@config/env';
import { Logo, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';

type IoniconName = keyof typeof Ionicons.glyphMap;

const ITEMS: { label: string; icon: IoniconName; route: keyof SectionsStackParamList }[] = [
  { label: 'Ver mi perfil', icon: 'person-outline', route: 'Profile' },
  { label: 'Legales y Estado de cuenta', icon: 'document-text-outline', route: 'Legal' },
  { label: 'Seguridad', icon: 'shield-checkmark-outline', route: 'Security' },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const { session, signOut } = useAuth();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#f9fafb' : '#0a0f14';

  return (
    <DrawerContentScrollView {...props}>
      <View className="gap-lg px-md pb-md">
        <View className="items-start">
          <Logo width={82} height={40} />
        </View>
        <View>
          <Text variant="h2">Hola 👋</Text>
          <Text variant="caption" tone="muted">
            {session?.username ?? ''}
          </Text>
        </View>

        <View className="gap-xs">
          {ITEMS.map((item) => (
            <Pressable
              key={item.route}
              className="flex-row items-center gap-md rounded-md py-md"
              onPress={() =>
                props.navigation.navigate('MainTabs', {
                  screen: 'Sections',
                  params: { screen: item.route },
                })
              }
              accessibilityRole="button"
            >
              <Ionicons name={item.icon} size={22} color={iconColor} />
              <Text variant="body">{item.label}</Text>
            </Pressable>
          ))}

          <Pressable
            className="mt-sm flex-row items-center gap-md rounded-md py-md"
            onPress={signOut}
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text variant="body" tone="danger">
              Cerrar sesión
            </Text>
          </Pressable>
        </View>

        <Text variant="caption" tone="muted">
          Versión {config.appVersion}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}
