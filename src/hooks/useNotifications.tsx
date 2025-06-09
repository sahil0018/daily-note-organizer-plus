
import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    console.log('Requesting notification permission...');
    if ('Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        console.log('Permission result:', result);
        setPermission(result);
        return result;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }
    return 'denied';
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    console.log('Attempting to show notification:', title, 'Permission:', permission);
    if (permission === 'granted' && 'Notification' in window) {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });

        // Auto close notification after 5 seconds unless requireInteraction is true
        if (!options?.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        return notification;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else {
      console.log('Cannot show notification - permission not granted or not supported');
    }
  }, [permission]);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
};
