import type { Result } from '@domain/shared/result';
import type { AppNotification } from '@domain/notifications/entities/Notification';

export type NotificationError =
  | { readonly type: 'network' }
  | { readonly type: 'unknown'; readonly message: string };

export interface NotificationRepository {
  list(): Promise<Result<readonly AppNotification[], NotificationError>>;
  markAsRead(id: string): Promise<Result<true, NotificationError>>;
}
