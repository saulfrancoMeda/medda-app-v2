import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { isValidPostalCode, type PostalCodeInfo } from '@domain/beneficiaries/entities/Beneficiary';
import { Text } from '@ui/design-system/components';
import { useLookupPostalCode } from '@ui/features/beneficiaries/hooks/useBeneficiaries';
import { palette } from '@ui/design-system/tokens/palette';

interface ColonyPickerProps {
  readonly postalCode: string;
  readonly value: string;
  readonly onSelect: (info: PostalCodeInfo) => void;
  readonly error?: string;
}

type Status =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'ready'; readonly colonies: readonly PostalCodeInfo[] };

// Resolves the colonies for a postal code on open; selecting one fills colony, municipality and state.
export function ColonyPicker({ postalCode, value, onSelect, error }: ColonyPickerProps) {
  const lookupPostalCode = useLookupPostalCode();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const insets = useSafeAreaInsets();

  const disabled = !isValidPostalCode(postalCode);

  const load = async () => {
    setStatus({ kind: 'loading' });
    const res = await lookupPostalCode(postalCode);
    if (!res.ok) {
      setStatus({
        kind: 'error',
        message:
          res.error.type === 'network'
            ? 'Revisa tu conexión e intenta de nuevo.'
            : 'No encontramos colonias para este código postal.',
      });
      return;
    }
    setStatus({ kind: 'ready', colonies: res.colonies });
  };

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
    void load();
  };

  const close = () => setOpen(false);

  return (
    <View className="w-full gap-sm">
      <Text variant="caption" tone="muted" className="font-medium">
        Colonia
      </Text>
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={{ height: 56 }}
        className="flex-row items-center gap-sm rounded-md border-2 border-transparent bg-neutral-100 px-md dark:bg-neutral-800"
      >
        <Ionicons name="location-outline" size={20} color={palette.neutral[400]} />
        <Text variant="body" tone={value ? 'default' : 'muted'} className="flex-1">
          {value || (disabled ? 'Captura un C.P. válido primero' : 'Selecciona una colonia')}
        </Text>
        {!disabled ? <Ionicons name="chevron-down" size={18} color={palette.neutral[400]} /> : null}
      </Pressable>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/50" onPress={close} />
          <View
            className="h-[75%] gap-md bg-neutral-0 px-lg pt-md dark:bg-neutral-900"
            style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: Math.max(insets.bottom, 24) }}
          >
          <Text variant="h2">Colonia</Text>
          {status.kind === 'loading' ? (
            <View className="items-center gap-sm py-lg">
              <ActivityIndicator color={palette.brand[500]} />
              <Text tone="muted">Buscando colonias…</Text>
            </View>
          ) : null}
          {status.kind === 'error' ? (
            <View className="gap-md py-lg">
              <Text tone="muted">{status.message}</Text>
              <Pressable accessibilityRole="button" onPress={() => void load()}>
                <Text tone="brand" className="font-semibold">
                  Reintentar
                </Text>
              </Pressable>
            </View>
          ) : null}
          {status.kind === 'ready' ? (
            <FlatList
              data={status.colonies}
              keyExtractor={(c, i) => `${c.id || c.colony}-${i}`}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text tone="muted">No hay colonias para este C.P.</Text>}
              renderItem={({ item }) => (
                <Pressable
                  className="border-b border-neutral-100 py-md dark:border-neutral-800"
                  onPress={() => {
                    onSelect(item);
                    close();
                  }}
                >
                  <Text variant="body">{item.colony}</Text>
                  {item.municipality || item.state ? (
                    <Text variant="caption" tone="muted">
                      {[item.municipality, item.state].filter(Boolean).join(', ')}
                    </Text>
                  ) : null}
                </Pressable>
              )}
            />
          ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
