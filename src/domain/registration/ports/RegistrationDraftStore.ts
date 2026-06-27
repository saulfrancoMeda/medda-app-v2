import type { RegistrationDraft } from '@domain/registration/entities/Registration';

export interface RegistrationDraftStore {
  read(): Promise<RegistrationDraft | null>;
  write(draft: RegistrationDraft): Promise<void>;
  clear(): Promise<void>;
}
