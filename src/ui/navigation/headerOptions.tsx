import { Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';

function HeaderBackButton({ tint }: { tint: string }) {
  const navigation = useNavigation();
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

export function useStackScreenOptions(): NativeStackNavigationOptions {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const tint = dark ? '#FAFAF9' : '#1B1812';
  const bg = dark ? '#131110' : '#ffffff';
  return {
    headerTintColor: tint,
    headerTitleAlign: 'center',
    headerTitleStyle: { color: tint, fontWeight: '700', fontSize: 18 },
    headerStyle: { backgroundColor: bg },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    headerBackButtonMenuEnabled: false,
    headerLeft:
      Platform.OS === 'android'
        ? ({ canGoBack, tintColor }) =>
          canGoBack ? <HeaderBackButton tint={tintColor ?? tint} /> : null
        : undefined,
  };
}
