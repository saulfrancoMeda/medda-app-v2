import { isBackendConfigured } from '@config/env';
import type { AuthGateway } from '@domain/auth/ports/AuthGateway';
import { CognitoAuthGateway } from '@infrastructure/auth/CognitoAuthGateway';
import { StubAuthGateway } from '@infrastructure/auth/StubAuthGateway';

/**
 * Composition root del gateway de auth: usa Cognito real cuando hay config (EXPO_PUBLIC_*),
 * o el stub (modo demo) cuando no.
 */
export const createAuthGateway = (): AuthGateway =>
  isBackendConfigured() ? new CognitoAuthGateway() : new StubAuthGateway();
