import type { Result } from '@domain/shared/result';
import type { LookupError, UserDirectory } from '@domain/auth/ports/UserDirectory';

export interface LookupUserNameDeps {
  readonly directory: UserDirectory;
}

/** Caso de uso del paso 1 del login: validar teléfono y obtener el nombre del backend. */
export const makeLookupUserName =
  (deps: LookupUserNameDeps) =>
  (phone: string): Promise<Result<string, LookupError>> =>
    deps.directory.getName(phone);
