import type { Session } from '@domain/auth/entities/Session';

export interface SessionStore {
  read(): Promise<Session | null>;
  write(session: Session): Promise<void>;
  clear(): Promise<void>;
}
