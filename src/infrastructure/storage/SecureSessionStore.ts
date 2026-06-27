import * as SecureStore from 'expo-secure-store';
import type { Session } from '@domain/auth/entities/Session';
import type { SessionStore } from '@domain/auth/ports/SessionStore';

const KEY = 'meda.session';

export class SecureSessionStore implements SessionStore {
  async read(): Promise<Session | null> {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  async write(session: Session): Promise<void> {
    await SecureStore.setItemAsync(KEY, JSON.stringify(session));
  }

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY);
  }
}
