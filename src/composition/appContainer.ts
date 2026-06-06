import { makeLogin } from '@application/auth/useCases/login';
import { makeLookupUserName } from '@application/auth/useCases/lookupUserName';
import { createAuthGateway } from '@infrastructure/auth/createAuthGateway';
import { AnonymousTokenProvider } from '@infrastructure/auth/AnonymousTokenProvider';
import { MedaUserDirectory } from '@infrastructure/auth/MedaUserDirectory';
import { SessionHolder } from '@infrastructure/auth/SessionHolder';
import { InMemorySessionStore } from '@infrastructure/storage/InMemorySessionStore';
import { HttpClient } from '@infrastructure/http/HttpClient';
import { MedaWalletRepository } from '@infrastructure/wallet/MedaWalletRepository';
import type { AuthGateway } from '@domain/auth/ports/AuthGateway';
import type { SessionStore } from '@domain/auth/ports/SessionStore';
import type { WalletRepository } from '@domain/wallet/ports/WalletRepository';

export interface AppContainer {
  readonly gateway: AuthGateway;
  readonly store: SessionStore;
  readonly sessionHolder: SessionHolder;
  readonly login: ReturnType<typeof makeLogin>;
  readonly lookupUserName: ReturnType<typeof makeLookupUserName>;
  readonly walletRepository: WalletRepository;
}

/**
 * Composition root de la app: ÚNICO lugar donde se eligen e instancian implementaciones de
 * infraestructura y se cablean los casos de uso. Un solo HttpClient resuelve el Authorization:
 *  - 'public' -> Bearer del token anónimo (client_credentials)
 *  - 'user'   -> JWT de Cognito de la sesión (vía SessionHolder)
 */
export const createAppContainer = (): AppContainer => {
  const gateway = createAuthGateway();
  const store = new InMemorySessionStore();
  const sessionHolder = new SessionHolder();

  const anonymous = new AnonymousTokenProvider();
  const http = new HttpClient(async (auth) => {
    if (auth === 'public') {
      const token = await anonymous.getToken();
      return token ? `Bearer ${token}` : null;
    }
    if (auth === 'user') {
      return sessionHolder.get();
    }
    return null;
  });

  const directory = new MedaUserDirectory(http);
  const walletRepository = new MedaWalletRepository(http);

  return {
    gateway,
    store,
    sessionHolder,
    login: makeLogin({ auth: gateway, store }),
    lookupUserName: makeLookupUserName({ directory }),
    walletRepository,
  };
};
