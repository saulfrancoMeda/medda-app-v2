import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Result } from '@domain/shared/result';
import type { Session } from '@domain/auth/entities/Session';
import type { AuthError, Credentials } from '@domain/auth/ports/AuthGateway';
import type { LookupError } from '@domain/auth/ports/UserDirectory';
import { isSessionExpired } from '@domain/auth/services/SessionManager';
import { useContainer } from '@ui/providers/ContainerProvider';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  readonly status: AuthStatus;
  readonly session: Session | null;
  readonly signIn: (credentials: Credentials) => Promise<Result<Session, AuthError>>;
  readonly signOut: () => Promise<void>;
  readonly lookupName: (phone: string) => Promise<Result<string, LookupError>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const container = useContainer();
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  const applySession = useCallback(
    (s: Session) => {
      container.sessionHolder.set(s.accessToken);
      setSession(s);
    },
    [container],
  );

  // Restaura la sesión guardada al abrir; si expiró, intenta refrescarla.
  useEffect(() => {
    let active = true;
    (async () => {
      const stored = await container.store.read();
      if (!active) return;
      if (stored && !isSessionExpired(stored, Date.now())) {
        applySession(stored);
      } else if (stored?.refreshToken) {
        const refreshed = await container.gateway.refresh(stored);
        if (active && refreshed.ok) {
          await container.store.write(refreshed.value);
          applySession(refreshed.value);
        } else if (active) {
          await container.store.clear();
        }
      }
      if (active) setRestoring(false);
    })().catch(() => {
      if (active) setRestoring(false);
    });
    return () => {
      active = false;
    };
  }, [container, applySession]);

  const status: AuthStatus = restoring ? 'loading' : session ? 'signedIn' : 'signedOut';

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const result = await container.login(credentials);
      if (result.ok) {
        applySession(result.value);
      }
      return result;
    },
    [container, applySession],
  );

  const signOut = useCallback(async () => {
    if (session) {
      await container.gateway.logout(session);
    }
    await container.store.clear();
    container.sessionHolder.set(null);
    setSession(null);
  }, [container, session]);

  const lookupName = useCallback((phone: string) => container.lookupUserName(phone), [container]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, signIn, signOut, lookupName }),
    [status, session, signIn, signOut, lookupName],
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
