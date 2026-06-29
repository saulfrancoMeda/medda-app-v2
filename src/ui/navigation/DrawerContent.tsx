import { Pressable, ScrollView, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { config } from '@config/env';
import { GoldGradient, Text } from '@ui/design-system/components';
import { useAuth } from '@ui/providers/AuthProvider';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import type { SectionsStackParamList } from '@ui/navigation/types';
import { palette } from '@ui/design-system/tokens/palette';

type IoniconName = keyof typeof Ionicons.glyphMap;

const ITEMS: { label: string; icon: IoniconName; route: keyof SectionsStackParamList }[] = [
  { label: 'Ver mi perfil', icon: 'person-outline', route: 'Profile' },
  { label: 'Legales y Estado de cuenta', icon: 'document-text-outline', route: 'Legal' },
  { label: 'Seguridad', icon: 'shield-checkmark-outline', route: 'Security' },
];

function Row({
  icon,
  label,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-md rounded-lg py-md"
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
    >
      <View className="h-11 w-11 items-center justify-center rounded-card bg-brand-100">
        <Ionicons name={icon} size={20} color={palette.brand[700]} />
      </View>
      <Text variant="body" className="flex-1 font-semibold">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={palette.neutral[400]} />
    </Pressable>
  );
}

export function DrawerContent(props: DrawerContentComponentProps) {
  const { session, signOut } = useAuth();
  const profile = useProfile();
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <ScrollView
        bounces={false}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <GoldGradient
          radius={0}
          style={{ paddingTop: insets.top + 32, paddingBottom: 36, paddingHorizontal: 20 }}
        >
          <Pressable
            className="absolute right-4 h-10 w-10 items-center justify-center rounded-pill"
            style={{ top: insets.top + 8, backgroundColor: 'rgba(27,24,18,0.12)' }}
            hitSlop={10}
            onPress={() => props.navigation.closeDrawer()}
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
          >
            <Ionicons name="close" size={24} color={palette.neutral[900]} />
          </Pressable>
          <View className="items-center gap-md pt-lg">
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                borderWidth: 4,
                borderColor: 'rgba(255,255,255,0.9)',
                backgroundColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 3 },
                elevation: 4,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {initials ? (
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: palette.brand[700] }}>
                  {initials}
                </Text>
              ) : (
                <Ionicons name="person" size={48} color={palette.brand[700]} />
              )}
            </View>

            <View className="items-center gap-1">
              <Text variant="h1" center className="text-ink" numberOfLines={2}>
                {name || 'Bienvenido'}
              </Text>
              {session?.username ? (
                <Text variant="body" center className="font-mono text-ink" style={{ opacity: 0.7 }}>
                  {session.username}
                </Text>
              ) : null}
            </View>
          </View>
        </GoldGradient>

        <View className="flex-1 p-lg justify-between">
          <View>
            {ITEMS.map((item) => (
              <Row key={item.route} icon={item.icon} label={item.label} onPress={() => go(item.route)} />
            ))}
            <Row icon="help-circle-outline" label="Preguntas frecuentes" onPress={goFaq} />
          </View>

          <View className="mt-xl gap-lg pb-md">
            <View className="h-px w-full bg-neutral-200 dark:bg-neutral-800" />
            <Pressable
              className="flex-row items-center gap-md rounded-lg"
              onPress={signOut}
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-card"
                style={{ backgroundColor: palette.dangerSoft }}
              >
                <Ionicons name="log-out-outline" size={22} color={palette.danger} />
              </View>
              <Text variant="body" tone="danger" className="flex-1 font-semibold">
                Cerrar sesión
              </Text>
            </Pressable>

            <Text variant="caption" tone="muted" center>
              Versión {config.appVersion}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
