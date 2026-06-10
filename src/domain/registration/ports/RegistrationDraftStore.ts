import type { RegistrationDraft } from '@domain/registration/entities/Registration';

// Persists the in-progress registration so a user who leaves can resume on the step they left.
export interface RegistrationDraftStore {
  read(): Promise<RegistrationDraft | null>;
  write(draft: RegistrationDraft): Promise<void>;
  clear(): Promise<void>;
}
