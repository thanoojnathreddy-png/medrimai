import { storageService } from './storageService';
import { soundService } from './soundService';

class NotificationService {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  sendReminder(title: string, body: string, medicineId?: string) {
    // In-app log & notification
    storageService.addNotification({
      type: 'reminder',
      title,
      message: body,
      read: false,
      medicineId,
    });

    const settings = storageService.getSettings();
    if (settings.soundEnabled) {
      soundService.playReminderChime();
    }

    // Browser native Notification if granted
    if (this.isSupported() && Notification.permission === 'granted' && settings.pushNotifications) {
      try {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/icon.svg',
          tag: medicineId || 'medisync-reminder',
        });
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  }
}

export const notificationService = new NotificationService();
