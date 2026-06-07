import { Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatCurrency } from '@domain/shared/money';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Text } from '@ui/design-system/components';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import { useBalance, useDefaultAccount, useSalesTotal } from '@ui/features/wallet/hooks/useWallet';
import type { AppTabsParamList, StoreStackParamList } from '@ui/navigation/types';

const pagoIllustration = require('../../../../../assets/brand/img_pago.png');

const formatLastLogin = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function AmountRow({
  icon,
  circle,
  iconColor,
  label,
  amountClass,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  circle: string;
  iconColor: string;
  label: string;
  amountClass: string;
  value?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-md border-b border-neutral-100 py-md dark:border-neutral-800"
    >
      <View className={`h-12 w-12 items-center justify-center rounded-pill ${circle}`}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text variant="body" tone="muted">
          {label}
        </Text>
        <Text variant="h2" className={amountClass}>
          {value !== undefined ? formatCurrency(value) : '—'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );
}

export function StoreScreen() {
  const tabNav = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const stackNav = useNavigation<NativeStackNavigationProp<StoreStackParamList>>();
  const profile = useProfile();
  const account = useDefaultAccount();
  const balance = useBalance(account.data?.id);
  const salesTotal = useSalesTotal();
  const p = profile.data;
  const initials = p ? `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase() : '';

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <ScrollView contentContainerClassName="gap-lg p-lg">
        <View className="flex-row items-center gap-md">
          <View className="h-12 w-12 items-center justify-center rounded-pill bg-neutral-200 dark:bg-neutral-800">
            {initials ? (
              <Text variant="body" className="font-semibold">
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={22} color="#9ca3af" />
            )}
          </View>
          <Text variant="h2" className="flex-1">
            {p ? `${p.firstName} ${p.lastName}` : 'Bienvenido'}
          </Text>
          <Pressable
            className="items-center"
            accessibilityRole="button"
            onPress={() => stackNav.navigate('MyQr')}
          >
            <Ionicons name="qr-code-outline" size={26} color="#c99400" />
            <Text variant="caption" tone="link">
              Mi QR
            </Text>
          </Pressable>
        </View>

        <Text variant="h2">Resumen de montos</Text>
        <View>
          <AmountRow
            icon="cash-outline"
            circle="bg-brand-500"
            iconColor="#0a0f14"
            label="Mi billetera"
            amountClass="text-brand-700"
            value={balance.data}
            onPress={() => tabNav.navigate('Wallet')}
          />
          <AmountRow
            icon="receipt-outline"
            circle="bg-neutral-800"
            iconColor="#ffffff"
            label="Mis gastos"
            amountClass="text-neutral-900 dark:text-neutral-50"
            value={salesTotal.data}
            onPress={() => tabNav.navigate('Sales')}
          />
        </View>

        <Text variant="h2">Servicios Medá</Text>
        <Pressable
          onPress={() => stackNav.navigate('ServicePayments')}
          accessibilityRole="button"
          className="flex-row items-center justify-between overflow-hidden rounded-card bg-brand-500 p-lg"
        >
          <Text variant="h2" className="flex-1 text-ink">
            Pago de servicios, tiempo aire y recargas
          </Text>
          <Image source={pagoIllustration} style={{ width: 72, height: 72 }} resizeMode="contain" />
        </Pressable>

        {p?.lastLogin ? (
          <Text variant="caption" tone="muted">
            Última sesión: {formatLastLogin(p.lastLogin)}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
