import { ActivityIndicator, ScrollView, View } from 'react-native';
import { fullName } from '@domain/account/entities/Profile';
import { Text } from '@ui/design-system/components';
import { useProfile } from '@ui/features/account/hooks/useAccount';

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="border-b border-neutral-100 py-md dark:border-neutral-800">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const profile = useProfile();

  if (profile.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator />
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

  return (
    <ScrollView className="flex-1 bg-neutral-0 dark:bg-neutral-950" contentContainerClassName="gap-lg p-lg">
      <View className="items-center gap-sm">
        <View className="h-20 w-20 items-center justify-center rounded-pill bg-brand-500">
          <Text variant="h1" className="text-ink">
            {initials}
          </Text>
        </View>
        <Text variant="h1" center>
          {fullName(p)}
        </Text>
      </View>

      <View className="rounded-card border border-neutral-200 px-lg dark:border-neutral-800">
        <Field label="ID de cliente" value={p.cellphone} />
        <Field label="Correo" value={p.email} />
        <Field label="Teléfono celular" value={p.cellphone} />
        <Field label="Teléfono fijo" value={p.phone} />
        <Field label="Fecha de nacimiento" value={p.birthDate} />
        <Field label="RFC" value={p.rfc} />
        <Field label="CURP" value={p.curp} />
        <Field label="Calle" value={p.homeAddress?.street} />
        <Field label="Colonia" value={p.homeAddress?.colony} />
        <Field label="Código postal" value={p.homeAddress?.postalCode} />
      </View>
    </ScrollView>
  );
}
