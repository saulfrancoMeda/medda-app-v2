import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  beneficiariesToDrafts,
  makeEmptyBeneficiaryDraft,
  validateBeneficiaries,
  validateBirthDate,
  type Beneficiary,
  type BeneficiaryDraft,
  type BeneficiaryFieldErrors,
  type BeneficiaryPercent,
  type PostalCodeInfo,
} from '@domain/beneficiaries/entities/Beneficiary';
import type { SaveBeneficiariesError } from '@application/beneficiaries/useCases/manageBeneficiaries';
import { Button, Input, Text } from '@ui/design-system/components';
import { cn } from '@ui/lib/cn';
import { ColonyPicker } from '@ui/features/beneficiaries/components/ColonyPicker';
import { ConfirmSaveModal } from '@ui/features/beneficiaries/components/ConfirmSaveModal';
import { PercentSelector } from '@ui/features/beneficiaries/components/PercentSelector';
import { beneficiaryErrorMessage } from '@ui/features/beneficiaries/errorMessages';
import { useSaveBeneficiaries } from '@ui/features/beneficiaries/hooks/useBeneficiaries';
import type { SectionsStackParamList } from '@ui/navigation/types';

type Props = NativeStackScreenProps<SectionsStackParamList, 'BeneficiariesEdit'>;

const MAX_BENEFICIARIES = 4;

const SPLITS: Record<number, readonly number[]> = {
  1: [100],
  2: [50, 50],
  3: [50, 25, 25],
  4: [25, 25, 25, 25],
};

const splitLabel = (count: number): string => {
  switch (count) {
    case 1:
      return 'Asignar 100%';
    case 2:
      return 'Repartir 50/50';
    case 3:
      return 'Sugerir 50/25/25';
    default:
      return 'Repartir 25/25/25/25';
  }
};

const initialDrafts = (initial?: readonly Beneficiary[]): BeneficiaryDraft[] => {
  if (initial && initial.length > 0) return beneficiariesToDrafts(initial);
  return [makeEmptyBeneficiaryDraft()];
};

const formatBirthDate = (text: string): string => {
  let digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length >= 1 && Number(digits[0]) > 3) {
    digits = `0${digits}`.slice(0, 8);
  }
  if (digits.length >= 3 && Number(digits[2]) > 1) {
    digits = `${digits.slice(0, 2)}0${digits.slice(2)}`.slice(0, 8);
  }

  const clampSegment = (segment: string, max: number): string =>
    segment.length === 2
      ? String(Math.min(Math.max(Number(segment), 1), max)).padStart(2, '0')
      : segment;

  const day = clampSegment(digits.slice(0, 2), 31);
  const month = clampSegment(digits.slice(2, 4), 12);
  const year = digits.slice(4, 8);

  if (digits.length > 4) return `${day}/${month}/${year}`;
  if (digits.length > 2) return `${day}/${month}`;
  return day;
};

export function BeneficiariesEditScreen({ route, navigation }: Props) {
  const [drafts, setDrafts] = useState<BeneficiaryDraft[]>(() =>
    initialDrafts(route.params?.initial),
  );
  const [errors, setErrors] = useState<readonly BeneficiaryFieldErrors[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, setPending] = useState<readonly Beneficiary[] | null>(null);

  const save = useSaveBeneficiaries();

  const totalPercent = drafts.reduce((sum, draft) => sum + (draft.percent ?? 0), 0);
  const remaining = 100 - totalPercent;

  const updateDraft = (index: number, updater: (draft: BeneficiaryDraft) => BeneficiaryDraft) =>
    setDrafts((prev) => prev.map((draft, i) => (i === index ? updater(draft) : draft)));

  const updateAddress = (index: number, patch: Partial<BeneficiaryDraft['address']>) =>
    updateDraft(index, (draft) => ({ ...draft, address: { ...draft.address, ...patch } }));

  const selectPercent = (index: number, percent: BeneficiaryPercent) => {
    setHint(null);
    updateDraft(index, (draft) => ({ ...draft, percent }));
  };

  const addBeneficiary = () => {
    if (drafts.length >= MAX_BENEFICIARIES) return;
    const hadHundred = drafts.some((draft) => draft.percent === 100);
    setDrafts((prev) => [
      ...prev.map((draft) => (draft.percent === 100 ? { ...draft, percent: null } : draft)),
      makeEmptyBeneficiaryDraft(),
    ]);
    setHint(
      hadHundred
        ? 'Quitamos el 100% porque ahora tienes más de un beneficiario. Reparte el porcentaje entre ellos.'
        : null,
    );
  };

  const removeBeneficiary = (index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const applySplit = () => {
    const distribution = SPLITS[drafts.length];
    if (!distribution) return;
    setHint(null);
    setDrafts((prev) =>
      prev.map((draft, i) => ({ ...draft, percent: distribution[i] ?? draft.percent })),
    );
  };

  const onColonySelected = (index: number, info: PostalCodeInfo) =>
    updateAddress(index, {
      colony: info.colony,
      colonySelected: info.id,
      municipality: info.municipality,
      state: info.state,
      postalCode: info.postalCode || drafts[index]?.address.postalCode || '',
    });

  const validateBirthDateField = (index: number) => {
    const message = validateBirthDate(drafts[index]?.birthDate ?? '');
    setErrors((prev) => {
      const next = drafts.map((_, i) => prev[i] ?? {});
      next[index] = { ...next[index], birthDate: message ?? undefined };
      return next;
    });
  };

  const onSubmit = () => {
    const result = validateBeneficiaries(drafts);
    if (!result.ok) {
      setErrors(result.error.errors);
      return;
    }
    setErrors([]);
    setSaveError(null);
    setPending(result.value);
  };

  const onConfirm = () => {
    save.mutate(drafts, {
      onSuccess: () => {
        setPending(null);
        navigation.goBack();
      },
      onError: (error) => {
        setPending(null);
        const e = error as unknown as SaveBeneficiariesError;
        setSaveError(e.type === 'validation' ? e.message : beneficiaryErrorMessage(e));
      },
    });
  };

  const summaryTone = totalPercent === 100 ? 'brand' : totalPercent > 100 ? 'danger' : 'muted';
  const summaryText =
    totalPercent === 0
      ? 'Asigna cómo se reparte el 100% entre tus beneficiarios.'
      : totalPercent < 100
        ? `Has asignado ${totalPercent}%. Falta ${remaining}%.`
        : totalPercent === 100
          ? 'Listo, tus beneficiarios suman 100%.'
          : `Te pasaste por ${totalPercent - 100}%. Ajusta los porcentajes.`;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-0 dark:bg-neutral-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="gap-lg p-lg" keyboardShouldPersistTaps="handled">
        {drafts.map((draft, index) => {
          const fieldErrors = errors[index] ?? {};
          const othersTotal = totalPercent - (draft.percent ?? 0);
          return (
            <View
              key={index}
              className="gap-md rounded-card border border-neutral-200 p-lg dark:border-neutral-800"
            >
              <View className="flex-row items-center justify-between">
                <Text variant="body" className="font-semibold">
                  Beneficiario {index + 1}
                </Text>
                {drafts.length > 1 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar beneficiario ${index + 1}`}
                    hitSlop={8}
                    onPress={() => removeBeneficiary(index)}
                    style={{ minHeight: 44 }}
                    className="flex-row items-center gap-sm"
                  >
                    <Ionicons name="trash-outline" size={18} color="#C24A30" />
                    <Text variant="caption" tone="danger" className="font-medium">
                      Quitar
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <Input
                label="Nombre(s)"
                leftIcon="person-outline"
                placeholder="Nombre"
                value={draft.firstName}
                onChangeText={(text) => updateDraft(index, (d) => ({ ...d, firstName: text }))}
                error={fieldErrors.firstName}
              />
              <Input
                label="Apellido paterno"
                placeholder="Apellido paterno"
                value={draft.lastName}
                onChangeText={(text) => updateDraft(index, (d) => ({ ...d, lastName: text }))}
                error={fieldErrors.lastName}
              />
              <Input
                label="Apellido materno (opcional)"
                placeholder="Apellido materno"
                value={draft.lastName2}
                onChangeText={(text) => updateDraft(index, (d) => ({ ...d, lastName2: text }))}
                error={fieldErrors.lastName2}
              />

              <PercentSelector
                value={draft.percent}
                maxPercent={100 - othersTotal}
                allowHundred={drafts.length === 1}
                onSelect={(percent) => selectPercent(index, percent)}
                error={fieldErrors.percent}
              />

              <Input
                label="Código postal"
                leftIcon="location-outline"
                placeholder="5 dígitos"
                keyboardType="number-pad"
                maxLength={5}
                value={draft.address.postalCode}
                onChangeText={(text) =>
                  updateAddress(index, { postalCode: text.replace(/\D/g, '').slice(0, 5) })
                }
                error={fieldErrors.postalCode}
              />
              <ColonyPicker
                postalCode={draft.address.postalCode}
                value={draft.address.colony}
                onSelect={(info) => onColonySelected(index, info)}
                error={fieldErrors.colony}
              />
              <Input
                label="Calle"
                leftIcon="home-outline"
                placeholder="Calle"
                value={draft.address.street}
                onChangeText={(text) => updateAddress(index, { street: text })}
                error={fieldErrors.street}
              />
              <View className="flex-row gap-md">
                <View className="flex-1">
                  <Input
                    label="No. exterior"
                    placeholder="Ext."
                    value={draft.address.extNumber}
                    onChangeText={(text) => updateAddress(index, { extNumber: text })}
                    error={fieldErrors.extNumber}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="No. interior (opcional)"
                    placeholder="Int."
                    value={draft.address.intNumber ?? ''}
                    onChangeText={(text) => updateAddress(index, { intNumber: text })}
                  />
                </View>
              </View>
              <Input
                label="Fecha de nacimiento (opcional)"
                leftIcon="calendar-outline"
                placeholder="DD/MM/AAAA"
                keyboardType="number-pad"
                maxLength={10}
                value={draft.birthDate}
                onChangeText={(text) =>
                  updateDraft(index, (d) => ({ ...d, birthDate: formatBirthDate(text) }))
                }
                onBlur={() => validateBirthDateField(index)}
                error={fieldErrors.birthDate}
              />
            </View>
          );
        })}
      </ScrollView>

      <View className="gap-md border-t border-neutral-100 p-lg dark:border-neutral-800">
        <View className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Text variant="caption" tone="muted">
              {drafts.length} de {MAX_BENEFICIARIES} beneficiarios
            </Text>
            <Text variant="caption" tone={summaryTone} className="font-semibold">
              {totalPercent}% / 100%
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-pill bg-neutral-100 dark:bg-neutral-800">
            <View
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
              className={cn('h-2 rounded-pill', totalPercent > 100 ? 'bg-danger' : 'bg-brand-500')}
            />
          </View>
          <Text variant="caption" tone={hint ? 'brand' : summaryTone}>
            {hint ?? summaryText}
          </Text>
        </View>

        {drafts.length < MAX_BENEFICIARIES || totalPercent !== 100 ? (
          <View className="flex-row gap-sm">
            {drafts.length < MAX_BENEFICIARIES ? (
              <View className="flex-1">
                <Button
                  title="Agregar beneficiario"
                  variant="soft"
                  size="sm"
                  full
                  onPress={addBeneficiary}
                />
              </View>
            ) : null}
            {totalPercent !== 100 ? (
              <View className="flex-1">
                <Button
                  title={splitLabel(drafts.length)}
                  variant="outline"
                  size="sm"
                  full
                  onPress={applySplit}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {saveError ? (
          <View className="flex-row items-center gap-sm rounded-md bg-danger/10 p-md">
            <Ionicons name="alert-circle-outline" size={20} color="#C24A30" />
            <Text variant="caption" tone="danger" className="flex-1">
              {saveError}
            </Text>
          </View>
        ) : null}

        <Button title="Guardar" full loading={save.isPending} onPress={onSubmit} />
      </View>

      <ConfirmSaveModal
        visible={pending !== null}
        beneficiaries={pending ?? []}
        loading={save.isPending}
        onConfirm={onConfirm}
        onClose={() => setPending(null)}
      />
    </KeyboardAvoidingView>
  );
}
