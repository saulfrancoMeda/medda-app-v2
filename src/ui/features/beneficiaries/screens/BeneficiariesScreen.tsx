import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  beneficiariesToDrafts,
  beneficiaryToDraft,
  formatBeneficiaryAddress,
  fullBeneficiaryName,
  latestBeneficiaryUpdate,
  type Beneficiary,
  type BeneficiaryDraft,
} from '@domain/beneficiaries/entities/Beneficiary';
import type { SaveBeneficiariesError } from '@application/beneficiaries/useCases/manageBeneficiaries';
import { Button, Text } from '@ui/design-system/components';
import { DeleteBeneficiaryModal } from '@ui/features/beneficiaries/components/DeleteBeneficiaryModal';
import { beneficiaryErrorMessage } from '@ui/features/beneficiaries/errorMessages';
import {
  useBeneficiariesQuery,
  useSaveBeneficiaries,
} from '@ui/features/beneficiaries/hooks/useBeneficiaries';
import type { SectionsStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<SectionsStackParamList, 'Beneficiaries'>;

const formatUpdate = (iso: string | null): string | null => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
};

// A beneficiary list must always sum to exactly 100% and never be empty (legacy rule). Deleting one
// is therefore resolved up front instead of leaving an invalid total: persist directly when the
// outcome is unambiguous, otherwise route to the edit form for manual reassignment.
type DeletePlan =
  | {
      readonly kind: 'block';
      readonly title: string;
      readonly message: string;
      readonly confirmLabel: string;
    }
  | {
      readonly kind: 'persist';
      readonly title: string;
      readonly message: string;
      readonly confirmLabel: string;
      readonly drafts: readonly BeneficiaryDraft[];
    }
  | {
      readonly kind: 'reassign';
      readonly title: string;
      readonly message: string;
      readonly confirmLabel: string;
      readonly remaining: readonly Beneficiary[];
    };

const buildDeletePlan = (target: Beneficiary, all: readonly Beneficiary[]): DeletePlan => {
  const remaining = all.filter((item) => item !== target);
  const name = fullBeneficiaryName(target);

  if (remaining.length === 0) {
    return {
      kind: 'block',
      title: 'Conserva un beneficiario',
      message: `${name} es tu único beneficiario. Debes conservar al menos uno; edítalo si quieres cambiar sus datos.`,
      confirmLabel: 'Editar beneficiario',
    };
  }

  const [survivor] = remaining;
  if (remaining.length === 1 && survivor) {
    return {
      kind: 'persist',
      title: 'Eliminar beneficiario',
      message: `Al eliminar a ${name}, ${fullBeneficiaryName(survivor)} quedará como tu único beneficiario con el 100%.`,
      confirmLabel: 'Eliminar beneficiario',
      drafts: [{ ...beneficiaryToDraft(survivor), percent: 100 }],
    };
  }

  const remainingTotal = remaining.reduce((sum, item) => sum + item.percent, 0);
  if (remainingTotal === 100) {
    return {
      kind: 'persist',
      title: 'Eliminar beneficiario',
      message: `Se eliminará a ${name}. El resto de tus beneficiarios ya suma 100%.`,
      confirmLabel: 'Eliminar beneficiario',
      drafts: beneficiariesToDrafts(remaining),
    };
  }

  return {
    kind: 'reassign',
    title: 'Eliminar y reasignar',
    message: `Al eliminar a ${name} deberás reasignar su ${target.percent}% entre el resto para sumar 100%.`,
    confirmLabel: 'Eliminar y reasignar',
    remaining,
  };
};

export function BeneficiariesScreen({ navigation }: Props) {
  const beneficiaries = useBeneficiariesQuery();
  const save = useSaveBeneficiaries();
  const data = beneficiaries.data ?? [];

  const [pendingDelete, setPendingDelete] = useState<Beneficiary | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const plan = pendingDelete ? buildDeletePlan(pendingDelete, data) : null;

  const goToEdit = (initial: readonly Beneficiary[]) =>
    navigation.navigate('BeneficiariesEdit', { initial: [...initial] });

  const requestDelete = (target: Beneficiary) => {
    setActionError(null);
    setPendingDelete(target);
  };

  const confirmDelete = () => {
    if (!plan || !pendingDelete) return;
    if (plan.kind === 'block') {
      const target = pendingDelete;
      setPendingDelete(null);
      goToEdit([target]);
      return;
    }
    if (plan.kind === 'reassign') {
      const remaining = plan.remaining;
      setPendingDelete(null);
      goToEdit(remaining);
      return;
    }
    save.mutate(plan.drafts, {
      onSuccess: () => setPendingDelete(null),
      onError: (error) => {
        setPendingDelete(null);
        const e = error as unknown as SaveBeneficiariesError;
        setActionError(e.type === 'validation' ? e.message : beneficiaryErrorMessage(e));
      },
    });
  };

  if (beneficiaries.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-0 dark:bg-neutral-950">
        <ActivityIndicator color="#FCD535" />
      </View>
    );
  }

  if (beneficiaries.isError) {
    return (
      <View className="flex-1 items-center justify-center gap-md bg-neutral-0 p-lg dark:bg-neutral-950">
        <Ionicons name="cloud-offline-outline" size={48} color="#9A9384" />
        <Text variant="body" tone="muted" center>
          No se pudieron cargar tus beneficiarios.
        </Text>
        <Button title="Reintentar" variant="outline" onPress={() => void beneficiaries.refetch()} />
      </View>
    );
  }

  const lastUpdate = formatUpdate(latestBeneficiaryUpdate(data));

  return (
    <View className="flex-1 bg-neutral-0 dark:bg-neutral-950">
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${fullBeneficiaryName(item)}-${index}`}
        contentContainerClassName="p-lg gap-md"
        refreshControl={
          <RefreshControl
            refreshing={beneficiaries.isRefetching}
            onRefresh={() => void beneficiaries.refetch()}
            tintColor="#FCD535"
          />
        }
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            {lastUpdate ? (
              <Text variant="caption" tone="muted">
                Última actualización: {lastUpdate}
              </Text>
            ) : null}
            {actionError ? (
              <View className="flex-row items-center gap-sm rounded-md bg-danger/10 p-md">
                <Ionicons name="alert-circle-outline" size={20} color="#C24A30" />
                <Text variant="caption" tone="danger" className="flex-1">
                  {actionError}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center gap-md py-2xl">
            <Ionicons name="people-outline" size={48} color="#9A9384" />
            <Text variant="body" tone="muted" center>
              Aún no tienes beneficiarios registrados.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="gap-sm rounded-card border border-neutral-200 p-lg dark:border-neutral-800">
            <View className="flex-row items-center justify-between">
              <Text variant="body" className="flex-1 pr-md font-semibold">
                {fullBeneficiaryName(item)}
              </Text>
              <Text variant="body" tone="brand" className="font-semibold">
                {item.percent}%
              </Text>
            </View>
            {formatBeneficiaryAddress(item.address) ? (
              <Text variant="caption" tone="muted">
                {formatBeneficiaryAddress(item.address)}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar a ${fullBeneficiaryName(item)}`}
              hitSlop={8}
              onPress={() => requestDelete(item)}
              style={{ minHeight: 44 }}
              className="mt-sm flex-row items-center gap-sm self-start"
            >
              <Ionicons name="trash-outline" size={18} color="#C24A30" />
              <Text variant="caption" tone="danger" className="font-medium">
                Eliminar
              </Text>
            </Pressable>
          </View>
        )}
      />
      <View className="gap-sm border-t border-neutral-100 p-lg dark:border-neutral-800">
        <Button
          title={data.length > 0 ? 'Editar beneficiarios' : 'Agregar beneficiario'}
          full
          onPress={() => goToEdit(data)}
        />
      </View>

      <DeleteBeneficiaryModal
        visible={plan !== null}
        title={plan?.title ?? ''}
        message={plan?.message ?? ''}
        confirmLabel={plan?.confirmLabel ?? ''}
        loading={save.isPending}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </View>
  );
}
