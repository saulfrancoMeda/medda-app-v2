import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Result } from '@domain/shared/result';
import type { Session } from '@domain/auth/entities/Session';
import type { AuthError, Credentials } from '@domain/auth/ports/AuthGateway';
import { createAuthContainer } from '@composition/authContainer';

type AuthStatus = 'signedOut' | 'signedIn';

interface AuthContextValue {
  readonly status: AuthStatus;
  readonly session: Session | null;
  readonly signIn: (credentials: Credentials) => Promise<Result<Session, AuthError>>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Contenedor (gateway + store + caso de uso) creado UNA sola vez vía inicializador lazy.
  const [container] = useState(createAuthContainer);
  const [session, setSession] = useState<Session | null>(null);
  const status: AuthStatus = session ? 'signedIn' : 'signedOut';

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const result = await container.login(credentials);
      if (result.ok) {
        setSession(result.value);
      }
      return result;
    },
    [container],
  );

  const signOut = useCallback(async () => {
    if (session) {
      await container.gateway.logout(session);
    }
    await container.store.clear();
    setSession(null);
  }, [container, session]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, signIn, signOut }),
    [status, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
