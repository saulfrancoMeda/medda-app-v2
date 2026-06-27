import { isBackendConfigured } from '@config/env';
import type { AuthGateway } from '@domain/auth/ports/AuthGateway';
import { CognitoAuthGateway } from '@infrastructure/auth/CognitoAuthGateway';
import { StubAuthGateway } from '@infrastructure/auth/StubAuthGateway';

export const createAuthGateway = (): AuthGateway =>
  isBackendConfigured() ? new CognitoAuthGateway() : new StubAuthGateway();
