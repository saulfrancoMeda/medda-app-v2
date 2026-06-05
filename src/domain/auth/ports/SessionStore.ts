import type { Session } from '@domain/auth/entities/Session';

/**
 * Puerto de persistencia de sesión. La implementación real guarda los tokens en
 * almacenamiento seguro (Keychain/Keystore vía expo-secure-store, o el futuro
 * TurboModule NativeSecureStore). El dominio no sabe dónde ni cómo.
 */
export interface SessionStore {
  read(): Promise<Session | null>;
  write(session: Session): Promise<void>;
  clear(): Promise<void>;
}
