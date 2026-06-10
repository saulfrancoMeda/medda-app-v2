import { makeLogin } from '@application/auth/useCases/login';
import { makeLookupUserName } from '@application/auth/useCases/lookupUserName';
import {
  makeListBeneficiaries,
  makeLookupPostalCode,
  makeSaveBeneficiaries,
} from '@application/beneficiaries/useCases/manageBeneficiaries';
import {
  makeCheckPhoneAvailable,
  makeExtractDocumentData,
  makeGetOccupations,
  makeGetRequiredDocuments,
  makeGetTransactionalProfileQuestions,
  makeRegister,
  makeSendVerificationCode,
  makeValidateVerificationCode,
} from '@application/registration/useCases/manageRegistration';
import { createAuthGateway } from '@infrastructure/auth/createAuthGateway';
import { AnonymousTokenProvider } from '@infrastructure/auth/AnonymousTokenProvider';
import { MedaUserDirectory } from '@infrastructure/auth/MedaUserDirectory';
import { SessionHolder } from '@infrastructure/auth/SessionHolder';
import { SecureSessionStore } from '@infrastructure/storage/SecureSessionStore';
import { HttpClient } from '@infrastructure/http/HttpClient';
import { MedaWalletRepository } from '@infrastructure/wallet/MedaWalletRepository';
import { MedaAccountRepository } from '@infrastructure/account/MedaAccountRepository';
import { MedaSupportRepository } from '@infrastructure/support/MedaSupportRepository';
import { MedaNotificationRepository } from '@infrastructure/notifications/MedaNotificationRepository';
import { MedaBeneficiaryRepository } from '@infrastructure/beneficiaries/MedaBeneficiaryRepository';
import { MedaRegistrationGateway } from '@infrastructure/registration/MedaRegistrationGateway';
import { SecureRegistrationDraftStore } from '@infrastructure/storage/SecureRegistrationDraftStore';
import { MedaPasswordRecovery } from '@infrastructure/auth/MedaPasswordRecovery';
import type { AuthGateway } from '@domain/auth/ports/AuthGateway';
import type { PasswordRecovery } from '@domain/auth/ports/PasswordRecovery';
import type { SessionStore } from '@domain/auth/ports/SessionStore';
import type { WalletRepository } from '@domain/wallet/ports/WalletRepository';
import type { AccountRepository } from '@domain/account/ports/AccountRepository';
import type { SupportRepository } from '@domain/support/ports/SupportRepository';
import type { NotificationRepository } from '@domain/notifications/ports/NotificationRepository';
import type { BeneficiaryRepository } from '@domain/beneficiaries/ports/BeneficiaryRepository';
import type { RegistrationGateway } from '@domain/registration/ports/RegistrationGateway';
import type { RegistrationDraftStore } from '@domain/registration/ports/RegistrationDraftStore';

export interface AppContainer {
  readonly gateway: AuthGateway;
  readonly store: SessionStore;
  readonly sessionHolder: SessionHolder;
  readonly login: ReturnType<typeof makeLogin>;
  readonly lookupUserName: ReturnType<typeof makeLookupUserName>;
  readonly walletRepository: WalletRepository;
  readonly accountRepository: AccountRepository;
  readonly supportRepository: SupportRepository;
  readonly notificationRepository: NotificationRepository;
  readonly beneficiaryRepository: BeneficiaryRepository;
  readonly listBeneficiaries: ReturnType<typeof makeListBeneficiaries>;
  readonly saveBeneficiaries: ReturnType<typeof makeSaveBeneficiaries>;
  readonly lookupPostalCode: ReturnType<typeof makeLookupPostalCode>;
  readonly registrationDraftStore: RegistrationDraftStore;
  readonly registrationGateway: RegistrationGateway;
  readonly checkPhoneAvailable: ReturnType<typeof makeCheckPhoneAvailable>;
  readonly sendVerificationCode: ReturnType<typeof makeSendVerificationCode>;
  readonly validateVerificationCode: ReturnType<typeof makeValidateVerificationCode>;
  readonly getRequiredDocuments: ReturnType<typeof makeGetRequiredDocuments>;
  readonly extractDocumentData: ReturnType<typeof makeExtractDocumentData>;
  readonly getOccupations: ReturnType<typeof makeGetOccupations>;
  readonly getTransactionalProfileQuestions: ReturnType<
    typeof makeGetTransactionalProfileQuestions
  >;
  readonly register: ReturnType<typeof makeRegister>;
  readonly passwordRecovery: PasswordRecovery;
}

export const createAppContainer = (): AppContainer => {
  const gateway = createAuthGateway();
  const store = new SecureSessionStore();
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
  const accountRepository = new MedaAccountRepository(http);
  const supportRepository = new MedaSupportRepository(http);
  const notificationRepository = new MedaNotificationRepository(http);
  const beneficiaryRepository = new MedaBeneficiaryRepository(http);
  const registrationGateway = new MedaRegistrationGateway(http);
  const registrationDraftStore = new SecureRegistrationDraftStore();
  const passwordRecovery = new MedaPasswordRecovery(http);

  return {
    gateway,
    store,
    sessionHolder,
    login: makeLogin({ auth: gateway, store }),
    lookupUserName: makeLookupUserName({ directory }),
    walletRepository,
    accountRepository,
    supportRepository,
    notificationRepository,
    beneficiaryRepository,
    listBeneficiaries: makeListBeneficiaries({ repository: beneficiaryRepository }),
    saveBeneficiaries: makeSaveBeneficiaries({ repository: beneficiaryRepository }),
    lookupPostalCode: makeLookupPostalCode({ repository: beneficiaryRepository }),
    registrationDraftStore,
    registrationGateway,
    checkPhoneAvailable: makeCheckPhoneAvailable({ gateway: registrationGateway }),
    sendVerificationCode: makeSendVerificationCode({ gateway: registrationGateway }),
    validateVerificationCode: makeValidateVerificationCode({ gateway: registrationGateway }),
    getRequiredDocuments: makeGetRequiredDocuments({ gateway: registrationGateway }),
    extractDocumentData: makeExtractDocumentData({ gateway: registrationGateway }),
    getOccupations: makeGetOccupations({ gateway: registrationGateway }),
    getTransactionalProfileQuestions: makeGetTransactionalProfileQuestions({
      gateway: registrationGateway,
    }),
    register: makeRegister({ gateway: registrationGateway }),
    passwordRecovery,
  };
};
