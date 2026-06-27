import type { Result } from '@domain/shared/result';
import type { LookupError, UserDirectory } from '@domain/auth/ports/UserDirectory';

export interface LookupUserNameDeps {
  readonly directory: UserDirectory;
}

export const makeLookupUserName =
  (deps: LookupUserNameDeps) =>
    (phone: string): Promise<Result<string, LookupError>> =>
      deps.directory.getName(phone);
