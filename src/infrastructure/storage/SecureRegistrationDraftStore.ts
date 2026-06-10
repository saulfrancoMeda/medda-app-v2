import * as SecureStore from 'expo-secure-store';
import type { RegistrationDraft } from '@domain/registration/entities/Registration';
import type { RegistrationDraftStore } from '@domain/registration/ports/RegistrationDraftStore';

const KEY = 'meda.registration';

// Stored encrypted at rest: the draft holds PII and the chosen password while the flow is in progress.
export class SecureRegistrationDraftStore implements RegistrationDraftStore {
  async read(): Promise<RegistrationDraft | null> {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      return raw ? (JSON.parse(raw) as RegistrationDraft) : null;
    } catch {
      return null;
    }
  }

  async write(draft: RegistrationDraft): Promise<void> {
    await SecureStore.setItemAsync(KEY, JSON.stringify(draft));
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY);
  }
}
