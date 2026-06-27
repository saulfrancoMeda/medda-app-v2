import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { findBankByClabe, isValidClabe, type Bank } from '@domain/wallet/entities/Transfer';
import { Button, Input, Text } from '@ui/design-system/components';
import { accountErrorMessage } from '@ui/features/account/errorMessages';
import { useNipAuthorization } from '@ui/features/common/useNipAuthorization';
import { BankPicker } from '@ui/features/wallet/components/BankPicker';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { SuccessView } from '@ui/features/common/SuccessView';
import { useSpeiBanks } from '@ui/features/wallet/hooks/useWallet';
import { useContainer } from '@ui/providers/ContainerProvider';
import { useAuth } from '@ui/providers/AuthProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = NativeStackScreenProps<SectionsStackParamList, 'CancelAccount'>;

export function CancelAccountScreen(_: Props) {
  const { accountRepository } = useContainer();
  const { signOut } = useAuth();
  const nipAuth = useNipAuthorization(accountErrorMessage);
  const banks = useSpeiBanks();
  const [clabe, setClabe] = useState('');
  const [bank, setBank] = useState<Bank | undefined>(undefined);

  const onClabeChange = (text: string) => {
    const next = text.replace(/[^0-9]/g, '');
    setClabe(next);
    const match = findBankByClabe(banks.data ?? [], next);
    if (match) setBank(match);
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const valid =
    isValidClabe(clabe) &&
    Boolean(bank) &&
    name.trim().length > 0 &&
    (email.length === 0 || EMAIL_RE.test(email));

  const authorize = (nip: string) => {
    if (!bank) return;
    void nipAuth.submit(
      () =>
        accountRepository.cancelAccount({
          clabe,
          bank: bank.code,
          beneficiaryName: name.trim(),
          email: email.trim() || undefined,
          nip,
        }),
      () => setDone(true),
    );
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
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
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
        leftIcon="card-outline"
        placeholder="18 dígitos"
        keyboardType="number-pad"
        maxLength={18}
        value={clabe}
        onChangeText={onClabeChange}
        error={clabe.length > 0 && !isValidClabe(clabe) ? 'CLABE inválida' : undefined}
      />
      <BankPicker value={bank} onSelect={setBank} />
      <Input
        label="Nombre del beneficiario"
        leftIcon="person-outline"
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
      />
      <Input
        label="Correo para notificaciones (opcional)"
        leftIcon="mail-outline"
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={email.length > 0 && !EMAIL_RE.test(email) ? 'Correo inválido' : undefined}
      />

      <Button title="Cancelar mi cuenta" full disabled={!valid} onPress={nipAuth.open} />

      <NipModal
        visible={nipAuth.visible}
        loading={nipAuth.loading}
        error={nipAuth.nipError}
        onSubmit={authorize}
        onClose={nipAuth.close}
      />
    </ScrollView>
  );
}
