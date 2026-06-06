import { useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { config } from '@config/env';
import { Text } from '@ui/design-system/components';
import { beneficiaryName } from '@domain/account/entities/Profile';
import { NipModal } from '@ui/features/wallet/components/NipModal';
import { useBeneficiaries, useStatements } from '@ui/features/account/hooks/useAccount';
import { useContainer } from '@ui/providers/ContainerProvider';
import type { SectionsStackParamList } from '@ui/navigation/types';

function Row({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
    >
      <Ionicons name={icon} size={22} color="#d7a300" />
      <Text variant="body" className="flex-1">
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );
}

type LegalProps = NativeStackScreenProps<SectionsStackParamList, 'Legal'>;

export function LegalScreen({ navigation }: LegalProps) {
  const docs = [
    { title: 'Términos y condiciones', url: config.legal.termsAndConditions },
    { title: 'Aviso de privacidad', url: config.legal.privacyAdvice },
    { title: 'Consulta de costos y comisiones', url: config.legal.commissions },
    { title: 'Contrato de Adhesión Medá', url: config.legal.adhesionContract },
  ];
  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-md p-lg">
      {docs.map((d) => (
        <Row
          key={d.title}
          icon="document-text-outline"
          title={d.title}
          onPress={() => d.url && Linking.openURL(d.url)}
        />
      ))}
      <Row icon="reader-outline" title="Estado de cuenta" onPress={() => navigation.navigate('Statements')} />
      <Row icon="people-outline" title="Mis beneficiarios" onPress={() => navigation.navigate('Beneficiaries')} />

      <View className="mt-md gap-sm rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
        <Text variant="body" className="font-semibold">
          Ligas de interés
        </Text>
        <Pressable onPress={() => Linking.openURL('https://www.condusef.gob.mx/')}>
          <Text variant="body" tone="link">
            CONDUSEF
          </Text>
        </Pressable>
        <Text variant="caption" tone="muted">
          Medá es una Institución de Fondos de Pago Electrónico. Los recursos de los clientes no se
          encuentran garantizados por el Gobierno Federal ni por las entidades de la administración
          pública.
        </Text>
      </View>
    </ScrollView>
  );
}

export function BeneficiariesScreen() {
  const beneficiaries = useBeneficiaries();
  if (beneficiaries.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <FlatList
      className="flex-1 bg-neutral-0 dark:bg-neutral-950"
      data={beneficiaries.data ?? []}
      keyExtractor={(_, i) => String(i)}
      contentContainerClassName="p-lg gap-md"
      ListEmptyComponent={
        <Text tone="muted" className="p-lg">
          {beneficiaries.isError ? 'No se pudieron cargar tus beneficiarios.' : 'No tienes beneficiarios registrados.'}
        </Text>
      }
      renderItem={({ item }) => (
        <View className="flex-row items-center justify-between rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
          <Text variant="body" className="flex-1 pr-md">
            {beneficiaryName(item)}
          </Text>
          {item.percent !== undefined ? (
            <Text variant="body" className="font-semibold text-brand-700">
              {item.percent}%
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

export function StatementsScreen() {
  const statements = useStatements();
  const { accountRepository } = useContainer();
  const [nipFor, setNipFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const onAuthorize = async (nip: string) => {
    if (!nipFor) return;
    setLoading(true);
    setError(undefined);
    const res = await accountRepository.getStatementPdfUrl(nipFor, nip);
    setLoading(false);
    if (!res.ok) {
      setError(res.error.type === 'unauthorized' ? 'NIP incorrecto' : 'No se pudo obtener el PDF');
      return;
    }
    setNipFor(null);
    void Linking.openURL(res.value);
  };

  if (statements.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <FlatList
        data={statements.data ?? []}
        keyExtractor={(s) => s.id}
        contentContainerClassName="p-lg gap-md"
        ListEmptyComponent={
          <Text tone="muted" className="p-lg">
            {statements.isError ? 'No se pudieron cargar tus estados de cuenta.' : 'Aún no tienes estados de cuenta.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setNipFor(item.id)}
            accessibilityRole="button"
            className="flex-row items-center gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
          >
            <Ionicons name="document-outline" size={22} color="#d7a300" />
            <Text variant="body" className="flex-1">
              {item.from.slice(0, 10)} – {item.to.slice(0, 10)}
            </Text>
            <Ionicons name="download-outline" size={20} color="#9ca3af" />
          </Pressable>
        )}
      />
      <NipModal
        visible={nipFor !== null}
        loading={loading}
        error={error}
        onSubmit={onAuthorize}
        onClose={() => setNipFor(null)}
      />
    </View>
  );
}
