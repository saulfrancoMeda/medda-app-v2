import { makeLogin } from '@application/auth/useCases/login';
import { createAuthGateway } from '@infrastructure/auth/createAuthGateway';
import { InMemorySessionStore } from '@infrastructure/storage/InMemorySessionStore';
import type { AuthGateway } from '@domain/auth/ports/AuthGateway';
import type { SessionStore } from '@domain/auth/ports/SessionStore';

export interface AuthContainer {
  readonly gateway: AuthGateway;
  readonly store: SessionStore;
  readonly login: ReturnType<typeof makeLogin>;
}

/**
 * Composition root de auth: ÚNICO lugar donde se eligen e instancian implementaciones
 * concretas de infraestructura (gateway, store) y se cablean los casos de uso. La capa `ui`
 * consume esto en vez de importar infraestructura directamente (lo prohíbe el lint).
 */
export const createAuthContainer = (): AuthContainer => {
  const gateway = createAuthGateway();
  const store = new InMemorySessionStore();
  return { gateway, store, login: makeLogin({ auth: gateway, store }) };
};
