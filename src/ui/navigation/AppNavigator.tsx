import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { WalletScreen } from '@ui/features/wallet/screens/WalletScreen';
import { PlaceholderScreen } from '@ui/features/common/PlaceholderScreen';
import { DrawerContent } from '@ui/navigation/DrawerContent';
import type { AppDrawerParamList, AppTabsParamList } from '@ui/navigation/types';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const Drawer = createDrawerNavigator<AppDrawerParamList>();

// Pantallas placeholder (paridad de estructura; contenido en fases siguientes).
const StoreScreen = () => <PlaceholderScreen title="Inicio" subtitle="Tu actividad — próximamente" />;
const SalesScreen = () => <PlaceholderScreen title="Mis gastos" subtitle="Próximamente" />;
const FaqScreen = () => <PlaceholderScreen title="Ayuda" subtitle="Preguntas frecuentes — próximamente" />;
const ProfileScreen = () => <PlaceholderScreen title="Mi perfil" />;
const LegalScreen = () => <PlaceholderScreen title="Legales y Estado de cuenta" />;
const SecurityScreen = () => <PlaceholderScreen title="Seguridad" />;

const TAB_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Store: 'home-outline',
  Sales: 'receipt-outline',
  Wallet: 'wallet-outline',
  Faq: 'help-circle-outline',
};

function MainTabs() {
  const { colorScheme } = useColorScheme();
  return (
    <Tabs.Navigator
      initialRouteName="Wallet"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#d7a300',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
        tabBarIcon: ({ color, size }) => {
          const name = TAB_ICON[route.name];
          return name ? <Ionicons name={name} size={size} color={color} /> : null;
        },
      })}
    >
      <Tabs.Screen name="Store" component={StoreScreen} options={{ title: 'Inicio' }} />
      <Tabs.Screen name="Sales" component={SalesScreen} options={{ title: 'Mis gastos' }} />
      <Tabs.Screen name="Wallet" component={WalletScreen} options={{ title: 'Mi Billetera' }} />
      <Tabs.Screen name="Faq" component={FaqScreen} options={{ title: 'Ayuda' }} />
      {/* Accesibles desde el drawer pero ocultas de la barra: conservan el bottom tab visible. */}
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="Legal"
        component={LegalScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tabs.Screen
        name="Security"
        component={SecurityScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
    </Drawer.Navigator>
  );
}
