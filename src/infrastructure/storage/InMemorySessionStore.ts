import type { Session } from '@domain/auth/entities/Session';
import type { SessionStore } from '@domain/auth/ports/SessionStore';

/**
 * SessionStore en memoria (no persiste entre reinicios). Suficiente para el modo demo.
 * En producción se reemplaza por uno sobre expo-secure-store / NativeSecureStore (Keychain
 * / Keystore) sin tocar el resto del código (mismo puerto SessionStore).
 */
export class InMemorySessionStore implements SessionStore {
  private current: Session | null = null;

  async read(): Promise<Session | null> {
    return this.current;
  }

  async write(session: Session): Promise<void> {
    this.current = session;
  }

  async clear(): Promise<void> {
    this.current = null;
  }
}
