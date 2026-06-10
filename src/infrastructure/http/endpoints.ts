/**
 * Superficie de endpoints del backend Medá, extraída del legacy
 * (app/src/AppConfig/apiEndpoints.js). `auth` indica el header Authorization que requiere:
 *  - 'public': Bearer <token anónimo> (grant client_credentials)
 *  - 'user':   JWT de Cognito (sesión del usuario)
 *  - 'none':   sin Authorization (p.ej. el propio token endpoint)
 */
export type EndpointAuth = 'public' | 'user' | 'none';

export interface Endpoint {
  readonly path: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly auth: EndpointAuth;
}

export const endpoints = {
  token: { path: '/oauth/v2/token', method: 'POST', auth: 'none' },
  getUserName: { path: '/public/user/name', method: 'GET', auth: 'public' },
  getLoginAttempts: { path: '/public/user/loginAttempts', method: 'GET', auth: 'public' },
  userProfile: { path: '/user/profile', method: 'GET', auth: 'user' },
  phoneSendCode: {
    path: '/public/security/phone/validation/sendCode',
    method: 'POST',
    auth: 'public',
  },
  validateCode: { path: '/public/security/code/validate', method: 'POST', auth: 'public' },
  changePasswordPublic: {
    path: '/public/security/password/change',
    method: 'POST',
    auth: 'public',
  },
  sendPasswordRecoverCodeByEmail: {
    path: '/public/security/password/recover/code/send/by-email',
    method: 'POST',
    auth: 'public',
  },
  validateNip: { path: '/public/security/nip/validate', method: 'POST', auth: 'public' },
  checkUserLock: { path: '/public/user/lock/check', method: 'POST', auth: 'public' },
  changePasswordAuthenticated: { path: '/security/password/change', method: 'POST', auth: 'user' },
  pushTokenSync: { path: '/user/notifications/pushtoken/sync', method: 'POST', auth: 'user' },
  // Wallet (autenticadas con JWT de Cognito)
  walletDefaultAccount: { path: '/wallet/accounts/default', method: 'GET', auth: 'user' },
  walletBalance: { path: '/wallet/accounts/balance', method: 'POST', auth: 'user' },
  walletStpAccount: { path: '/wallet/stp/account', method: 'GET', auth: 'user' },
  walletMovements: { path: '/wallet/movements/list', method: 'GET', auth: 'user' },
  walletStpBanks: { path: '/wallet/stp/banks', method: 'GET', auth: 'user' },
  walletSpeiSend: { path: '/wallet/transactions/spei/send', method: 'POST', auth: 'user' },
  walletTransferToResource: {
    path: '/wallet/accounts/transfer/toResource',
    method: 'POST',
    auth: 'user',
  },
  nipValidate: { path: '/user/nip/validate', method: 'POST', auth: 'user' },
  // Cuenta / seguridad
  nipChange: { path: '/user/nip/change', method: 'PUT', auth: 'user' },
  nipSet: { path: '/user/nip/set', method: 'PUT', auth: 'user' },
  passwordValidate: { path: '/security/password/validate', method: 'POST', auth: 'user' },
  emailValidationCodeSend: {
    path: '/user/email/validation/code/send',
    method: 'POST',
    auth: 'user',
  },
  emailValidationCodeValidate: {
    path: '/user/email/validation/code/validate',
    method: 'POST',
    auth: 'user',
  },
  cancelAccount: { path: '/user/account/cancel', method: 'POST', auth: 'user' },
  unlockCodeSend: { path: '/public/user/unlock/code/send', method: 'POST', auth: 'public' },
  unlockCodeValidate: { path: '/public/user/unlock/code/validate', method: 'POST', auth: 'public' },
  accountStatementsList: { path: '/account-statements/list', method: 'GET', auth: 'user' },
  accountStatementPdf: { path: '/account-statements/pdf', method: 'POST', auth: 'user' },
  // Inicio / Mis gastos / Ayuda
  faqs: { path: '/public/agents/faqs', method: 'GET', auth: 'public' },
  walletCategories: { path: '/wallet/categories/list', method: 'GET', auth: 'user' },
  walletServices: { path: '/wallet/services/list', method: 'GET', auth: 'user' },
  servicePaymentProcess: {
    path: '/wallet/services/payments/process',
    method: 'POST',
    auth: 'user',
  },
  salesTotal: { path: '/balances/sales/total', method: 'GET', auth: 'user' },
  emailChange: { path: '/user/email/change', method: 'PATCH', auth: 'user' },
  credentialsCheck: { path: '/user/credentials/check', method: 'POST', auth: 'user' },
  usernameChangeCodeSend: {
    path: '/user/username/change/verificationcode/send',
    method: 'POST',
    auth: 'user',
  },
  usernameChangeCodeValidate: {
    path: '/user/username/change/verificationcode/validate',
    method: 'POST',
    auth: 'user',
  },
  usernameChangeSet: { path: '/user/username/change/set', method: 'POST', auth: 'user' },
  register: { path: '/public/register/v2', method: 'POST', auth: 'public' },
  documentsRequired: { path: '/public/documents/id/required', method: 'POST', auth: 'public' },
  blackListCheck: { path: '/public/black-lists/check', method: 'POST', auth: 'public' },
  transactionalProfileQuestions: {
    path: '/public/survey/declarative/profile/questions',
    method: 'GET',
    auth: 'public',
  },
  occupations: { path: '/public/catalogs/occupations', method: 'GET', auth: 'public' },
  beneficiariesList: { path: '/beneficiaries/list', method: 'GET', auth: 'user' },
  beneficiariesEdit: { path: '/beneficiaries/edit', method: 'PUT', auth: 'user' },
  postalCodeInfo: { path: '/public/postalCode/info', method: 'GET', auth: 'public' },
  notificationsList: { path: '/notifications/list', method: 'GET', auth: 'user' },
} as const satisfies Record<string, Endpoint>;

/** Endpoint de marcar notificación como leída (path con parámetro `{notification}`). */
export const notificationReadEndpoint = (id: string): Endpoint => ({
  path: `/notifications/${id}/mark-as-read`,
  method: 'PUT',
  auth: 'user',
});

/** OCR de un documento de identidad (path con parámetro `{documento}`). */
export const documentDataExtractEndpoint = (documentId: string): Endpoint => ({
  path: `/public/document/${documentId}/data-extract`,
  method: 'POST',
  auth: 'public',
});

export type EndpointName = keyof typeof endpoints;
