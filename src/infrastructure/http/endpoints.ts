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
  phoneSendCode: { path: '/public/security/phone/validation/sendCode', method: 'POST', auth: 'public' },
  validateCode: { path: '/public/security/code/validate', method: 'POST', auth: 'public' },
  changePasswordPublic: { path: '/public/security/password/change', method: 'POST', auth: 'public' },
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
  nipValidate: { path: '/user/nip/validate', method: 'POST', auth: 'user' },
} as const satisfies Record<string, Endpoint>;

export type EndpointName = keyof typeof endpoints;
