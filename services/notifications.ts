// Push notification service
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../config/firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications and save token to Firestore
 */
export const registerForPushNotifications = async (
  userId: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // Check if running on physical device (required for push notifications)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1A5D1A',
      });
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return {
        success: false,
        error: 'Permission not granted for push notifications',
      };
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      return {
        success: false,
        error: 'Project ID not found. Please configure EAS in app.json',
      };
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Save token to Firestore
    await setDoc(doc(db, 'deviceTokens', userId), {
      token,
      platform: Platform.OS,
      updatedAt: new Date(),
    }, { merge: true });

    console.log('Push notification token registered:', token);
    return { success: true, token };
  } catch (error: any) {
    console.error('Error registering for push notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a local notification (appears on device immediately)
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<{ success: boolean; notificationId?: string; error?: string }> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });

    return { success: true, notificationId };
  } catch (error: any) {
    console.error('Error sending local notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation notification
 */
export const sendOrderConfirmationNotification = async (
  orderId: string,
  totalAmount: number,
  itemCount: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await sendLocalNotification(
      '🎉 Order Placed Successfully!',
      `Your order of ${itemCount} item${itemCount > 1 ? 's' : ''} (RM${totalAmount.toFixed(2)}) has been confirmed.`,
      {
        orderId,
        type: 'order_confirmation',
        screen: 'order-details',
      }
    );

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error('Error sending order confirmation notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification via Expo Push API
 */
export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (response.ok && result.data) {
      console.log('Push notification sent successfully');
      return { success: true };
    } else {
      console.error('Push notification failed:', result);
      return { success: false, error: result.errors?.[0]?.message || 'Failed to send notification' };
    }
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order status update notification
 */
export const sendOrderStatusNotification = async (
  orderId: string,
  status: string,
  restaurantName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let title = '';
    let body = '';

    switch (status) {
      case 'confirmed':
        title = '✅ Order Confirmed';
        body = `${restaurantName} has confirmed your order and is preparing it.`;
        break;
      case 'preparing':
        title = '👨‍🍳 Preparing Your Order';
        body = `${restaurantName} is now preparing your delicious meal!`;
        break;
      case 'on-the-way':
        title = '🚗 Order On The Way';
        body = `Your order from ${restaurantName} is on its way to you!`;
        break;
      case 'delivered':
        title = '🎊 Order Delivered';
        body = `Your order has been delivered. Enjoy your meal!`;
        break;
      case 'cancelled':
        title = '❌ Order Cancelled';
        body = `Your order from ${restaurantName} has been cancelled.`;
        break;
      default:
        title = '📦 Order Update';
        body = `Your order status has been updated to: ${status}`;
    }

    const result = await sendLocalNotification(title, body, {
      orderId,
      status,
      type: 'order_status',
      screen: 'order-details',
    });

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error('Error sending order status notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send promotional notification
 */
export const sendPromoNotification = async (
  title: string,
  body: string,
  promoCode?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await sendLocalNotification(title, body, {
      type: 'promo',
      promoCode,
      screen: 'home-page',
    });

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error('Error sending promo notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has enabled specific notification type
 */
export const checkNotificationSettings = async (
  userId: string,
  notificationType: 'payments' | 'specialOffers' | 'promoDiscount' | 'cashback'
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      return false; // Default to disabled if no settings found
    }

    const settings = settingsSnap.data();
    return settings[notificationType] ?? false;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return false;
  }
};

/**
 * Check if general notifications are enabled
 */
export const checkGeneralNotifications = async (userId: string): Promise<boolean> => {
  try {
    const settingsRef = doc(db, 'notificationSettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
      return true; // Default to enabled
    }

    const settings = settingsSnap.data();
    return settings.generalNotification ?? true;
  } catch (error) {
    console.error('Error checking general notifications:', error);
    return true;
  }
};

/**
 * Add notification received listener
 * Call this in your app's root component
 */
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 * Call this in your app's root component
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Get the last notification response (useful for handling notifications when app launches)
 */
export const getLastNotificationResponse = async () => {
  return await Notifications.getLastNotificationResponseAsync();
};

