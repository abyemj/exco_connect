/**
 * Represents a notification.
 */
export interface Notification {
  /**
   * The recipient of the notification.
   */
  recipient: string;
  /**
   * The subject of the notification.
   */
  subject: string;
  /**
   * The body of the notification.
   */
  body: string;
}

/**
 * Asynchronously sends a notification.
 *
 * @param notification The notification to send.
 * @returns A promise that resolves when the notification has been sent.
 */
export async function sendNotification(notification: Notification): Promise<void> {
  // TODO: Implement this by calling an API.
  return;
}
