import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);
  return (
    <Tabs.Navigator
      initialRouteName="Store"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#97720A',
        tabBarInactiveTintColor: dark ? '#9A9384' : '#6C6555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarStyle: {
          height: 64 + bottomInset,
          paddingTop: 12,
          paddingBottom: bottomInset,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: dark ? '#1B1812' : '#ffffff',
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 16,
        },
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
