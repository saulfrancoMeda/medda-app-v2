import { err, ok, type Result } from '@domain/shared/result';
import type { LookupError, UserDirectory } from '@domain/auth/ports/UserDirectory';
import type { HttpClient } from '@infrastructure/http/HttpClient';
import { endpoints } from '@infrastructure/http/endpoints';

interface UserNameResponse {
  user?: string;
}

export class MedaUserDirectory implements UserDirectory {
  constructor(private readonly http: HttpClient) { }

  async getName(phone: string): Promise<Result<string, LookupError>> {
    const res = await this.http.request<UserNameResponse>(endpoints.getUserName, {
      query: { cellphone: phone },
    });
    if (!res.ok) {
      const bodyText = JSON.stringify(res.error.body ?? '');
      if (/cancel/i.test(bodyText)) return err({ type: 'account_cancel_requested' });
      if (res.error.kind === 'network') return err({ type: 'network' });
      if (res.error.status === 404) return err({ type: 'not_found' });
      return err({ type: 'unknown', message: res.error.message });
    }
    const name = res.value.user;
    if (!name) return err({ type: 'not_found' });
    return ok(name);
  }
}
