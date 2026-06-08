import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { isValidClabe, type Bank } from '@domain/wallet/entities/Transfer';
import type { AccountError } from '@domain/account/ports/AccountRepository';
import { Button, Input, Text } from '@ui/design-system/components';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { SuccessView } from '@ui/features/common/SuccessView';
import { useSpeiBanks } from '@ui/features/wallet/hooks/useWallet';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useAuth } from '@ui/providers/AuthProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const accountErrorMessage = (e: AccountError): string =>
  e.type === 'unauthorized'
    ? 'Datos incorrectos. Verifica tu NIP.'
    : e.type === 'network'
      ? 'Revisa tu conexión a internet'
      : e.message || 'No se pudo cancelar la cuenta';

function BankPicker({ value, onSelect }: { value?: Bank; onSelect: (b: Bank) => void }) {
  const [open, setOpen] = useState(false);
  const banks = useSpeiBanks();
  return (
    <View className="w-full gap-xs">
      <Text variant="caption" tone="muted">
        Banco
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="h-14 flex-row items-center justify-between rounded-md bg-neutral-100 px-md dark:bg-neutral-800"
      >
        <Text variant="body" tone={value ? 'default' : 'muted'}>
          {value?.name ?? 'Selecciona un banco'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9A9384" />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)} />
        <View className="max-h-[70%] gap-sm rounded-t-xl bg-neutral-0 p-lg dark:bg-neutral-900">
          <Text variant="h2">Banco</Text>
          {banks.isPending ? <Text tone="muted">Cargando bancos…</Text> : null}
          {banks.isError ? <Text tone="muted">No se pudieron cargar los bancos.</Text> : null}
          <FlatList
            data={banks.data ?? []}
            keyExtractor={(b) => b.code}
            renderItem={({ item }) => (
              <Pressable
                className="border-b border-neutral-100 py-md dark:border-neutral-800"
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text variant="body">{item.name}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

type Props = NativeStackScreenProps<SectionsStackParamList, 'CancelAccount'>;

export function CancelAccountScreen(_: Props) {
  const { accountRepository } = useContainer();
  const { signOut } = useAuth();
  const [clabe, setClabe] = useState('');
  const [bank, setBank] = useState<Bank | undefined>(undefined);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nipVisible, setNipVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);

  const valid =
    isValidClabe(clabe) &&
    Boolean(bank) &&
    name.trim().length > 0 &&
    (email.length === 0 || EMAIL_RE.test(email));

  const authorize = async (nip: string) => {
    if (!bank) return;
    setLoading(true);
    setNipError(undefined);
    const res = await accountRepository.cancelAccount({
      clabe,
      bank: bank.code,
      beneficiaryName: name.trim(),
      email: email.trim() || undefined,
      nip,
    });
    setLoading(false);
    if (!res.ok) {
      setNipError(accountErrorMessage(res.error));
      return;
    }
    setNipVisible(false);
    setDone(true);
  };

  if (done) {
    return (
      <SuccessView
        title="Solicitud recibida"
        description="Ya recibimos tu solicitud de cancelación. Dispersaremos tu saldo a la cuenta indicada."
        buttonTitle="Entendido"
        onPress={() => void signOut()}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      <View className="gap-sm rounded-card bg-danger/10 p-lg">
        <View className="flex-row items-center gap-sm">
          <Ionicons name="warning-outline" size={22} color="#C24A30" />
          <Text variant="body" tone="danger" className="font-semibold">
            Estás por cancelar tu cuenta
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          No debes tener aclaraciones pendientes. Si tienes saldo, lo dispersaremos a la cuenta CLABE
          que indiques a continuación. Esta acción es irreversible.
        </Text>
      </View>

      <Text variant="body" className="font-semibold">
        ¿A qué cuenta enviamos tu saldo?
      </Text>
      <Input
        label="CLABE (18 dígitos)"
        keyboardType="number-pad"
        maxLength={18}
        value={clabe}
        onChangeText={(t) => setClabe(t.replace(/[^0-9]/g, ''))}
        error={clabe.length > 0 && !isValidClabe(clabe) ? 'CLABE inválida' : undefined}
      />
      <BankPicker value={bank} onSelect={setBank} />
      <Input label="Nombre del beneficiario" value={name} onChangeText={setName} />
      <Input
        label="Correo para notificaciones (opcional)"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={email.length > 0 && !EMAIL_RE.test(email) ? 'Correo inválido' : undefined}
      />

      <Button title="Cancelar mi cuenta" full disabled={!valid} onPress={() => setNipVisible(true)} />

      <NipModal
        visible={nipVisible}
        loading={loading}
        error={nipError}
        onSubmit={authorize}
        onClose={() => setNipVisible(false)}
      />
    </ScrollView>
  );
}
