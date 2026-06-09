import { useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { config } from '@config/env';
import { Text } from '@ui/design-system/components';
import { beneficiaryName } from '@domain/account/entities/Profile';
import { accountErrorMessage } from '@ui/features/account/errorMessages';
import { useNipAuthorization } from '@ui/features/common/useNipAuthorization';
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
      <Ionicons name={icon} size={22} color="#97720A" />
      <Text variant="body" className="flex-1">
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#9A9384" />
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
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      {docs.map((d) => (
        <Row
          key={d.title}
          icon="document-text-outline"
          title={d.title}
          onPress={() => {
            if (!d.url) return;
            navigation.navigate('PdfViewer', { title: d.title, url: d.url });
          }}
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
  const nipAuth = useNipAuthorization(accountErrorMessage);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openFor = (id: string) => {
    setSelectedId(id);
    nipAuth.open();
  };

  const authorize = (nip: string) => {
    if (!selectedId) return;
    void nipAuth.submit(
      () => accountRepository.getStatementPdfUrl(selectedId, nip),
      (url) => void Linking.openURL(url),
    );
  };

  if (statements.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator color="#FCD535" />
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
            onPress={() => openFor(item.id)}
            accessibilityRole="button"
            className="flex-row items-center gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
          >
            <Ionicons name="document-outline" size={22} color="#97720A" />
            <Text variant="body" className="flex-1">
              {item.from.slice(0, 10)} – {item.to.slice(0, 10)}
            </Text>
            <Ionicons name="download-outline" size={20} color="#9A9384" />
          </Pressable>
        )}
      />
      <NipModal
        visible={nipAuth.visible}
        loading={nipAuth.loading}
        error={nipAuth.nipError}
        onSubmit={authorize}
        onClose={nipAuth.close}
      />
    </View>
  );
}

type PdfViewerProps = NativeStackScreenProps<SectionsStackParamList, 'PdfViewer'>;

export function PdfViewerScreen({ route }: PdfViewerProps) {
  const [webLoading, setWebLoading] = useState(true);
  const { url } = route.params;

  if (!url) {
    return (
      <View className="flex-1 items-center justify-center gap-md bg-neutral-0 p-lg dark:bg-neutral-950">
        <Ionicons name="document-outline" size={48} color="#9A9384" />
        <Text variant="body" tone="muted" center>
          Este documento no está disponible por ahora.
        </Text>
      </View>
    );
  }

  // Android no renderiza PDFs en WebView nativamente: usamos el visor de Google Docs.
  const pdfUrl =
    Platform.OS === 'ios'
      ? url
      : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  return (
    <View className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <WebView
        source={{ uri: pdfUrl }}
        onLoadEnd={() => setWebLoading(false)}
        onError={() => setWebLoading(false)}
        style={{ flex: 1 }}
        startInLoadingState
      />
      {webLoading ? (
        <View className="absolute inset-0 items-center justify-center gap-md bg-neutral-0 dark:bg-neutral-950">
          <ActivityIndicator size="large" color="#FCD535" />
          <Text variant="body" tone="muted">
            Cargando documento…
          </Text>
        </View>
      ) : null}
    </View>
  );
}
