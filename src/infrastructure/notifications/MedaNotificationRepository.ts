import { err, ok, type Result } from '@domain/shared/result';
import type { AppNotification } from '@domain/notifications/entities/Notification';
import type {
  NotificationError,
  NotificationRepository,
} from '@domain/notifications/ports/NotificationRepository';
import type { HttpClient, HttpError } from '@infrastructure/http/HttpClient';
import { endpoints, notificationReadEndpoint } from '@infrastructure/http/endpoints';

interface RawNotification {
  id?: string | number;
  subject?: string;
  message?: string;
  image?: string;
  read?: boolean;
  dateCreated?: string;
}

const toNotificationError = (e: HttpError): NotificationError =>
  e.kind === 'network' ? { type: 'network' } : { type: 'unknown', message: e.message };

export class MedaNotificationRepository implements NotificationRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Result<readonly AppNotification[], NotificationError>> {
    const res = await this.http.request<RawNotification[] | { notifications?: RawNotification[] }>(
      endpoints.notificationsList,
    );
    if (!res.ok) return err(toNotificationError(res.error));
    const list: RawNotification[] = Array.isArray(res.value)
      ? res.value
      : (res.value.notifications ?? []);
    const notifications: AppNotification[] = list.map((n) => ({
      id: String(n.id ?? ''),
      subject: n.subject,
      message: n.message ?? '',
      image: n.image,
      read: n.read === true,
      dateCreated: n.dateCreated,
    }));
    return ok(notifications);
  }

  async markAsRead(id: string): Promise<Result<true, NotificationError>> {
    const res = await this.http.request<unknown>(notificationReadEndpoint(id));
    if (!res.ok) return err(toNotificationError(res.error));
    return ok(true);
  }
}
