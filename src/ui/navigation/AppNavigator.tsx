import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
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
import { palette } from '@ui/design-system/tokens/palette';

const Tabs = createBottomTabNavigator<AppTabsParamList>();
const Drawer = createDrawerNavigator<AppDrawerParamList>();

const TAB_ICON_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  Store: 'home',
  Sales: 'receipt',
  Wallet: 'wallet',
  Faq: 'help-circle',
};
const TAB_ICON_INACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  Store: 'home-outline',
  Sales: 'receipt-outline',
  Wallet: 'wallet-outline',
  Faq: 'help-circle-outline',
};

function MainTabs() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const bg = dark ? palette.neutral[900] : palette.neutral[0];
  const borderColor = dark ? '#2A2520' : '#F0EDE8';

  return (
    <Tabs.Navigator
      initialRouteName="Store"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.brand[700],
        tabBarInactiveTintColor: palette.neutral[400],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarItemStyle: { overflow: 'hidden' },
        tabBarStyle: {
          height: 64 + bottomInset,
          paddingTop: 10,
          paddingBottom: bottomInset,
          backgroundColor: bg,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarIcon: ({ color, focused }) => {
          const name = focused
            ? TAB_ICON_ACTIVE[route.name]
            : TAB_ICON_INACTIVE[route.name];
          return name ? <Ionicons name={name} size={22} color={color} /> : null;
        },
      })}
    >
      <Tabs.Screen
        name="Store"
        component={StoreStackNavigator}
        options={{ title: 'Inicio' }}
        listeners={({ navigation }) => ({
          // @ts-expect-error nested screen reset on tab press
          tabPress: () => { navigation.navigate('Store', { screen: 'StoreHome' }); },
        })}
      />
      <Tabs.Screen name="Sales" component={SalesScreen} options={{ title: 'Mis gastos' }} />
      <Tabs.Screen
        name="Wallet"
        component={WalletStackNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'WalletHome';
          if (focused !== 'WalletHome') {
            return { title: 'Mi Billetera', tabBarStyle: { display: 'none' } };
          }
          return { title: 'Mi Billetera' };
        }}
        listeners={({ navigation }) => ({
          tabPress: () => { navigation.navigate('Wallet', { screen: 'WalletHome' } as never); },
        })}
      />
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
