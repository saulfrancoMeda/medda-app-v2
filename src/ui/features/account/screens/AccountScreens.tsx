import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fullName } from '@domain/account/entities/Profile';
import { Text } from '@ui/design-system/components';
import { useProfile } from '@ui/features/account/hooks/useAccount';
import type { SectionsStackParamList } from '@ui/navigation/types';

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 py-md dark:border-neutral-800">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="body" className={mono ? 'font-mono' : undefined}>
        {value}
      </Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-xs">
      <Text variant="caption" tone="muted" className="px-xs uppercase">
        {title}
      </Text>
      <View className="rounded-card border border-neutral-200 px-lg dark:border-neutral-800">
        {children}
      </View>
    </View>
  );
}

type Props = NativeStackScreenProps<SectionsStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const profile = useProfile();

  if (profile.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator color="#FCD535" />
      </View>
    );
  }
  if (profile.isError || !profile.data) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 px-lg dark:bg-neutral-950">
        <Text tone="muted" center>
          No pudimos cargar tu perfil. Inténtalo de nuevo.
        </Text>
      </View>
    );
  }

  const p = profile.data;
  const initials = `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase();
  const hasAddress = Boolean(p.homeAddress?.street || p.homeAddress?.colony || p.homeAddress?.postalCode);

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="items-center gap-sm">
        <View className="h-24 w-24 items-center justify-center rounded-pill bg-brand-100 dark:bg-brand-900">
          <Text variant="display" className="text-brand-700 dark:text-brand-300">
            {initials}
          </Text>
        </View>
        <Text variant="h1" center>
          {fullName(p)}
        </Text>
        {p.email ? (
          <Text variant="body" tone="muted" center>
            {p.email}
          </Text>
        ) : null}
      </View>

      <SectionCard title="Información personal">
        <Field label="ID de cliente" value={p.cellphone} mono />
        <Field label="Correo" value={p.email} />
        <Field label="Teléfono celular" value={p.cellphone} mono />
        <Field label="Teléfono fijo" value={p.phone} mono />
        <Field label="Fecha de nacimiento" value={p.birthDate} />
        <Field label="RFC" value={p.rfc} mono />
        <Field label="CURP" value={p.curp} mono />
      </SectionCard>

      {hasAddress ? (
        <SectionCard title="Domicilio">
          <Field label="Calle" value={p.homeAddress?.street} />
          <Field label="Colonia" value={p.homeAddress?.colony} />
          <Field label="Código postal" value={p.homeAddress?.postalCode} mono />
        </SectionCard>
      ) : null}


      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('CancelAccount')}
        className="flex-row items-center gap-md rounded-card border border-danger/30 p-lg"
      >
        <Ionicons name="trash-outline" size={22} color="#C24A30" />
        <Text variant="body" tone="danger" className="flex-1">
          Cancelar mi cuenta
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#C24A30" />
      </Pressable>
    </ScrollView>
  );
}
