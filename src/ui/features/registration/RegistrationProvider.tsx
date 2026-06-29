import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  makeEmptyRegistrationDraft,
  type RegistrationDraft,
} from '@domain/registration/entities/Registration';
import { useContainer } from '@ui/providers/ContainerProvider';

interface RegistrationContextValue {
  readonly draft: RegistrationDraft;
  readonly hydrated: boolean;
  readonly update: (patch: Partial<RegistrationDraft>) => void;
  readonly reset: () => void;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const { registrationDraftStore } = useContainer();
  const [draft, setDraft] = useState<RegistrationDraft>(makeEmptyRegistrationDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await registrationDraftStore.read();
      if (active && stored) setDraft({ ...makeEmptyRegistrationDraft(), ...stored });
    })()
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [registrationDraftStore]);

  const update = useCallback(
    (patch: Partial<RegistrationDraft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        void registrationDraftStore.write(next);
        return next;
      });
    },
    [registrationDraftStore],
  );

  const reset = useCallback(() => {
    setDraft(makeEmptyRegistrationDraft());
    void registrationDraftStore.clear();
  }, [registrationDraftStore]);

  const value = useMemo(() => ({ draft, hydrated, update, reset }), [draft, hydrated, update, reset]);

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration(): RegistrationContextValue {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error('useRegistration debe usarse dentro de <RegistrationProvider>');
  return ctx;
}
