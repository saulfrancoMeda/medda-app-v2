import { useState } from 'react';
import type { Result } from '@domain/shared/result';
import { useToast } from '@ui/providers/ToastProvider';

type AuthorizableError = { readonly type: string };

const NIP_INVALID = 'NIP incorrecto. Verifícalo e intenta de nuevo.';

export function useNipAuthorization<E extends AuthorizableError>(serviceErrorMessage: (e: E) => string) {
  const toast = useToast();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nipError, setNipError] = useState<string | undefined>(undefined);

  const open = () => {
    setNipError(undefined);
    setVisible(true);
  };

  const close = () => setVisible(false);

  const submit = async <T>(
    action: () => Promise<Result<T, E>>,
    onSuccess: (value: T) => void,
  ) => {
    setLoading(true);
    setNipError(undefined);
    const res = await action();
    setLoading(false);
    if (res.ok) {
      setVisible(false);
      onSuccess(res.value);
      return;
    }
    if (res.error.type === 'unauthorized') {
      setNipError(NIP_INVALID);
      return;
    }
    setVisible(false);
    toast.error(serviceErrorMessage(res.error));
  };

  return { visible, loading, nipError, open, close, submit };
}
