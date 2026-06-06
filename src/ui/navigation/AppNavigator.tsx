import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { WalletStackNavigator } from '@ui/navigation/WalletStackNavigator';
import { SectionsStackNavigator } from '@ui/navigation/SectionsStackNavigator';
import { FaqStackNavigator } from '@ui/navigation/FaqStackNavigator';
import { StoreStackNavigator } from '@ui/navigation/StoreStackNavigator';
import { SalesScreen } from '@ui/features/wallet/screens/SalesScreen';
import { DrawerContent } from '@ui/navigation/DrawerContent';
import type { AppDrawerParamList, AppTabsParamList } from '@ui/navigation/types';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const Drawer = createDrawerNavigator<AppDrawerParamList>();

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
      <Tabs.Screen name="Store" component={StoreStackNavigator} options={{ title: 'Inicio' }} />
      <Tabs.Screen name="Sales" component={SalesScreen} options={{ title: 'Mis gastos' }} />
      <Tabs.Screen name="Wallet" component={WalletStackNavigator} options={{ title: 'Mi Billetera' }} />
      <Tabs.Screen name="Faq" component={FaqStackNavigator} options={{ title: 'Ayuda' }} />
      {/* Tab oculto: secciones del drawer (Perfil/Legales/Seguridad). Mantiene el bottom tab. */}
      <Tabs.Screen
        name="Sections"
        component={SectionsStackNavigator}
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
