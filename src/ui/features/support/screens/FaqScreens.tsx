import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { config } from '@config/env';
import { AppHeader } from '@ui/navigation/AppHeader';
import { Button, Input, Text } from '@ui/design-system/components';
import { useFaqs } from '@ui/features/support/hooks/useSupport';
import type { FaqStackParamList } from '@ui/navigation/types';

type ListProps = NativeStackScreenProps<FaqStackParamList, 'FaqList'>;

export function FaqListScreen({ navigation }: ListProps) {
  const faqs = useFaqs();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const data = faqs.data ?? [];
    if (!q) return data;
    return data.filter(
      (f) => f.question.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [faqs.data, query]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <AppHeader />
      <FlatList
        data={filtered}
        keyExtractor={(f) => f.id}
        contentContainerClassName="gap-md p-lg"
        ListHeaderComponent={
          <View className="gap-md pb-sm">
            <Text variant="h1">¿En qué te podemos ayudar?</Text>
            <Input
              placeholder="Busca por palabra clave…"
              value={query}
              onChangeText={setQuery}
            />
            <Pressable
              onPress={() => navigation.navigate('Chat')}
              accessibilityRole="button"
              className="flex-row items-center gap-md rounded-card bg-brand-500 p-lg"
            >
              <Ionicons name="chatbubbles" size={24} color="#0a0f14" />
              <View className="flex-1">
                <Text variant="body" className="font-semibold text-ink">
                  Chatea con nosotros
                </Text>
                <Text variant="caption" className="text-ink">
                  Para aclarar tus dudas
                </Text>
              </View>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('FaqDetail', { item })}
            accessibilityRole="button"
            className="flex-row items-center gap-md border-b border-neutral-100 py-md dark:border-neutral-800"
          >
            <Text variant="body" className="flex-1">
              {item.question}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        )}
        ListEmptyComponent={
          faqs.isPending ? (
            <ActivityIndicator className="mt-lg" />
          ) : (
            <Text tone="muted">
              {faqs.isError ? 'No pudimos cargar las preguntas.' : 'Sin resultados.'}
            </Text>
          )
        }
        ListFooterComponent={
          config.supportPhone ? (
            <Button
              title={`Llamar al Centro de Atención`}
              variant="outline"
              full
              className="mt-lg"
              onPress={() => Linking.openURL(`tel:${config.supportPhone}`)}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

type DetailProps = NativeStackScreenProps<FaqStackParamList, 'FaqDetail'>;

const htmlDocument = (body: string) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>body{font-family:-apple-system,Roboto,sans-serif;font-size:16px;color:#0a0f14;padding:16px;line-height:1.5;}</style>
</head><body>${body}</body></html>`;

export function FaqDetailScreen({ route }: DetailProps) {
  const { item } = route.params;
  return (
    <View className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <View className="p-lg">
        <Text variant="h2">{item.question}</Text>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlDocument(item.response) }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
    </View>
  );
}

export function ChatScreen({ navigation }: NativeStackScreenProps<FaqStackParamList, 'Chat'>) {
  // Cache-buster calculado una vez (no en cada render) para no romper la regla de pureza.
  const [cacheBust] = useState(() => Date.now());
  if (!config.chatUri) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 px-lg dark:bg-neutral-950">
        <Text tone="muted" center>
          El chat no está disponible por ahora.
        </Text>
      </View>
    );
  }
  return (
    <WebView
      source={{ uri: `${config.chatUri}?v=${cacheBust}` }}
      originWhitelist={['*']}
      javaScriptEnabled
      incognito
      cacheEnabled={false}
      onMessage={() => navigation.goBack()}
      style={{ flex: 1 }}
    />
  );
}
