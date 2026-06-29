import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@ui/providers/AuthProvider';
import { Text } from '@ui/design-system/components';
import { palette } from '@ui/design-system/tokens/palette';

export function MyQrScreen() {
  const { session } = useAuth();
  const value = session?.username ?? '';
  return (
    <View className="flex-1 items-center justify-center gap-lg bg-neutral-0 p-lg dark:bg-neutral-950">
      <Text variant="h2" center>
        Mi código QR
      </Text>
      <Text variant="body" tone="muted" center>
        Muestra este código para recibir dinero de otro usuario Medá.
      </Text>
      <View className="rounded-card bg-neutral-0 p-lg shadow">
        {value ? <QRCode value={value} size={220} color={palette.neutral[900]} backgroundColor={palette.neutral[0]} /> : null}
      </View>
      <Text variant="body" className="font-semibold">
        {value}
      </Text>
    </View>
  );
}
