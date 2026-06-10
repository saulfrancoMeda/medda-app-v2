import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BeneficiaryDraft, PostalCodeInfo } from '@domain/beneficiaries/entities/Beneficiary';
import type { LookupPostalCodeError } from '@application/beneficiaries/useCases/manageBeneficiaries';
import { useContainer } from '@ui/providers/ContainerProvider';

export const BENEFICIARIES_QUERY_KEY = ['beneficiaries'] as const;

export function useBeneficiariesQuery() {
  const { listBeneficiaries } = useContainer();
  return useQuery({
    queryKey: BENEFICIARIES_QUERY_KEY,
    queryFn: async () => {
      const res = await listBeneficiaries();
      if (!res.ok) throw res.error;
      return res.value;
    },
  });
}

export function useSaveBeneficiaries() {
  const { saveBeneficiaries } = useContainer();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drafts: readonly BeneficiaryDraft[]) => {
      const res = await saveBeneficiaries(drafts);
      if (!res.ok) throw res.error;
      return res.value;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BENEFICIARIES_QUERY_KEY });
    },
  });
}

export function useLookupPostalCode() {
  const { lookupPostalCode } = useContainer();
  return async (
    postalCode: string,
  ): Promise<
    { ok: true; colonies: readonly PostalCodeInfo[] } | { ok: false; error: LookupPostalCodeError }
  > => {
    const res = await lookupPostalCode(postalCode);
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, colonies: res.value };
  };
}
