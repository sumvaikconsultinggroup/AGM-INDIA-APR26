import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });

    // Panchang daily channel
    await Notifications.setNotificationChannelAsync('panchang_daily', {
      name: 'Daily Panchang',
      description: 'Daily Panchang alerts at Brahma Muhurta time',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });

    // Festival alerts channel
    await Notifications.setNotificationChannelAsync('festival_alerts', {
      name: 'Festival Alerts',
      description: 'Notifications for upcoming Hindu festivals',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

/**
 * Schedule a local notification for Brahma Muhurta (4:30 AM daily).
 * This is a fallback for when Firebase is not available.
 */
export async function scheduleBrahmaMuhurtaReminder(): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Brahma Muhurta',
        body: 'The most auspicious time for meditation and spiritual practice has begun.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 4,
        minute: 30,
      },
    });
    return identifier;
  } catch (error) {
    console.warn('Failed to schedule Brahma Muhurta reminder:', error);
    return null;
  }
}

/**
 * Cancel Brahma Muhurta reminder
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
