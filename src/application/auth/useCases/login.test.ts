import { describe, expect, it } from '@jest/globals';
import { makeLogin } from '@application/auth/useCases/login';
import type { AuthGateway, Credentials } from '@domain/auth/ports/AuthGateway';
import type { SessionStore } from '@domain/auth/ports/SessionStore';
import type { Session } from '@domain/auth/entities/Session';
import { err, ok } from '@domain/shared/result';

const session: Session = {
  username: 'agente@meda.com.mx',
  oauth: { accessToken: 'tok', refreshToken: 'ref', tokenType: 'Bearer', expiresAt: 1 },
};
const creds: Credentials = { username: 'agente@meda.com.mx', password: 'secreto' };

const makeStore = () => {
  const writes: Session[] = [];
  const store: SessionStore = {
    read: async () => null,
    write: async (s) => {
      writes.push(s);
    },
    clear: async () => {},
  };
  return { store, writes };
};

describe('login use case', () => {
  it('persiste la sesión cuando el login es exitoso', async () => {
    const auth: AuthGateway = {
      login: async () => ok(session),
      refresh: async () => ok(session),
      logout: async () => ok(undefined),
    };
    const { store, writes } = makeStore();

    const result = await makeLogin({ auth, store })(creds);

    expect(result.ok).toBe(true);
    expect(writes).toEqual([session]);
  });

  it('NO persiste la sesión cuando el login falla', async () => {
    const auth: AuthGateway = {
      login: async () => err({ type: 'invalid_credentials' }),
      refresh: async () => ok(session),
      logout: async () => ok(undefined),
    };
    const { store, writes } = makeStore();

    const result = await makeLogin({ auth, store })(creds);

    expect(result.ok).toBe(false);
    expect(writes).toEqual([]);
  });
});
