import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Bank } from '@domain/wallet/entities/Transfer';
import { Text } from '@ui/design-system/components';
import { palette } from '@ui/design-system/tokens/palette';
import { useSpeiBanks } from '@ui/features/wallet/hooks/useWallet';

interface BankPickerProps {
  readonly value?: Bank;
  readonly onSelect: (bank: Bank) => void;
}

export function BankPicker({ value, onSelect }: BankPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const banks = useSpeiBanks();

  const filtered = useMemo(() => {
    const list = banks.data ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((b) => b.name.toLowerCase().includes(q)) : list;
  }, [banks.data, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View className="w-full gap-sm">
      <Text variant="caption" tone="muted" className="font-medium">
        Banco destino
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={{ height: 56 }}
        className="flex-row items-center gap-sm rounded-md border-2 border-transparent bg-neutral-100 px-md dark:bg-neutral-800"
      >
        <Ionicons name="business-outline" size={20} color={palette.neutral[400]} />
        <Text variant="body" tone={value ? 'default' : 'muted'} className="flex-1">
          {value?.name ?? 'Selecciona un banco'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={palette.neutral[400]} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <View className="flex-1 justify-end">
          <Pressable className="absolute inset-0 bg-black/50" onPress={close} />
          <View
            className="h-[75%] gap-md bg-neutral-0 px-lg pt-md dark:bg-neutral-900"
            style={{ borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingBottom: Math.max(insets.bottom, 24) }}
          >
          <Text variant="h2">Banco destino</Text>
          <View
            style={{ height: 56 }}
            className="flex-row items-center gap-sm rounded-md bg-neutral-100 px-md dark:bg-neutral-800"
          >
            <Ionicons name="search-outline" size={20} color={palette.neutral[400]} />
            <TextInput
              placeholder="Busca tu banco"
              placeholderTextColor={palette.neutral[400]}
              value={query}
              onChangeText={setQuery}
              autoFocus
              className="h-full flex-1 text-body text-neutral-900 dark:text-neutral-50"
            />
          </View>
          {banks.isPending ? <Text tone="muted">Cargando bancos…</Text> : null}
          {banks.isError ? <Text tone="muted">No se pudieron cargar los bancos.</Text> : null}
          <FlatList
            data={filtered}
            keyExtractor={(b) => b.code}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !banks.isPending ? <Text tone="muted">Sin resultados.</Text> : null
            }
            renderItem={({ item }) => (
              <Pressable
                className="border-b border-neutral-100 py-md dark:border-neutral-800"
                onPress={() => {
                  onSelect(item);
                  close();
                }}
              >
                <Text variant="body">{item.name}</Text>
              </Pressable>
            )}
          />
          </View>
        </View>
      </Modal>
    </View>
  );
}
