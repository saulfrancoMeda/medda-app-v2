import { makeLogin } from '@application/auth/useCases/login';
import { makeLookupUserName } from '@application/auth/useCases/lookupUserName';
import { createAuthGateway } from '@infrastructure/auth/createAuthGateway';
import { AnonymousTokenProvider } from '@infrastructure/auth/AnonymousTokenProvider';
import { MedaUserDirectory } from '@infrastructure/auth/MedaUserDirectory';
import { InMemorySessionStore } from '@infrastructure/storage/InMemorySessionStore';
import { HttpClient } from '@infrastructure/http/HttpClient';
import type { AuthGateway } from '@domain/auth/ports/AuthGateway';
import type { SessionStore } from '@domain/auth/ports/SessionStore';

export interface AuthContainer {
  readonly gateway: AuthGateway;
  readonly store: SessionStore;
  readonly login: ReturnType<typeof makeLogin>;
  readonly lookupUserName: ReturnType<typeof makeLookupUserName>;
}

/**
 * Composition root de auth: ÚNICO lugar donde se eligen e instancian implementaciones de
 * infraestructura (gateway, store, HTTP, token anónimo) y se cablean los casos de uso.
 */
export const createAuthContainer = (): AuthContainer => {
  const gateway = createAuthGateway();
  const store = new InMemorySessionStore();

  // HttpClient: para endpoints públicos usa el token anónimo como Bearer.
  const anonymous = new AnonymousTokenProvider();
  const http = new HttpClient(async (auth) => {
    if (auth === 'public') {
      const token = await anonymous.getToken();
      return token ? `Bearer ${token}` : null;
    }
    return null; // 'user' (sesión) se cableará en fases posteriores; 'none' no lleva header
  });
  const directory = new MedaUserDirectory(http);

  return {
    gateway,
    store,
    login: makeLogin({ auth: gateway, store }),
    lookupUserName: makeLookupUserName({ directory }),
  };
};
