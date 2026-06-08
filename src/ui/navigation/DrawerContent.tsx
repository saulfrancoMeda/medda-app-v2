import { Pressable, View } from 'react-native';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { config } from '@config/env';
import { GoldGradient, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import type { SectionsStackParamList } from '@ui/navigation/types';

type IoniconName = keyof typeof Ionicons.glyphMap;

const ITEMS: { label: string; icon: IoniconName; route: keyof SectionsStackParamList }[] = [
  { label: 'Legales y Estado de cuenta', icon: 'document-text-outline', route: 'Legal' },
  { label: 'Seguridad', icon: 'shield-checkmark-outline', route: 'Security' },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const { session, signOut } = useAuth();
  const profile = useProfile();
  const p = profile.data;
  const name = p ? `${p.firstName} ${p.lastName}` : (session?.username ?? '');
  const initials = p ? `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase() : '';

  const go = (route: keyof SectionsStackParamList) => {
    props.navigation.closeDrawer();
    props.navigation.navigate('MainTabs', { screen: 'Sections', params: { screen: route } });
  };

  const goFaq = () => {
    props.navigation.closeDrawer();
    props.navigation.navigate('MainTabs', { screen: 'Faq' });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <GoldGradient radius={0} style={{ paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20 }}>
        <Pressable
          className="absolute right-4 top-12"
          hitSlop={10}
          onPress={() => props.navigation.closeDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        >
          <Ionicons name="close" size={26} color="#1B1812" />
        </Pressable>
        <View className="items-center gap-sm">
          <View
            className="h-20 w-20 items-center justify-center rounded-pill bg-brand-100"
            style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)' }}
          >
            {initials ? (
              <Text variant="h1" className="text-brand-700">
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={32} color="#97720A" />
            )}
          </View>
          <Text variant="h2" center className="text-ink">
            {name || 'Bienvenido'}
          </Text>
          <Pressable onPress={() => go('Profile')} accessibilityRole="button">
            <Text variant="body" className="text-ink" style={{ opacity: 0.7 }}>
              Ver mi perfil
            </Text>
          </Pressable>
        </View>
      </GoldGradient>

      <View className="gap-xs p-md">
        {ITEMS.map((item) => (
          <Pressable
            key={item.route}
            className="flex-row items-center gap-md border-b border-neutral-100 py-md dark:border-neutral-800"
            onPress={() => go(item.route)}
            accessibilityRole="button"
          >
            <View className="h-11 w-11 items-center justify-center rounded-card bg-brand-100">
              <Ionicons name={item.icon} size={20} color="#97720A" />
            </View>
            <Text variant="body" className="flex-1 font-semibold">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9A9384" />
          </Pressable>
        ))}

        <Pressable
          className="flex-row items-center gap-md border-b border-neutral-100 py-md dark:border-neutral-800"
          onPress={goFaq}
          accessibilityRole="button"
        >
          <View className="h-11 w-11 items-center justify-center rounded-card bg-brand-100">
            <Ionicons name="help-circle-outline" size={20} color="#97720A" />
          </View>
          <Text variant="body" className="flex-1 font-semibold">
            Preguntas frecuentes
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9A9384" />
        </Pressable>

        <Pressable
          className="mt-md flex-row items-center gap-md py-md"
          onPress={signOut}
          accessibilityRole="button"
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-card"
            style={{ backgroundColor: '#FAE8E2' }}
          >
            <Ionicons name="log-out-outline" size={20} color="#C24A30" />
          </View>
          <Text variant="body" tone="danger" className="flex-1 font-semibold">
            Cerrar sesión
          </Text>
        </Pressable>

        <Text variant="caption" tone="muted" center className="pt-lg">
          Versión {config.appVersion}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}
