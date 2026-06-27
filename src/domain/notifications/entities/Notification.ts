export interface AppNotification {
  readonly id: string;
  readonly subject?: string;
  readonly message: string;
  readonly image?: string;
  readonly read: boolean;
  readonly dateCreated?: string;
}

export const unreadCount = (items: readonly AppNotification[]): number =>
  items.reduce((n, item) => (item.read ? n : n + 1), 0);
