// Push notification service
import * as Notifications from 'expo-notifications';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../config/firebase';

/**
 * Register device for push notifications and save token to Firestore
 */
export const registerForPushNotifications = async (
  userId: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // Check if running on physical device (required for push notifications)
    if (!Platform.isTV && (Platform.OS === 'android' || Platform.OS === 'ios')) {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { 
          success: false, 
          error: 'Permission not granted for push notifications' 
        };
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '1b05a6be-def3-4b5e-909a-8540db1582b2',
      });
      const token = tokenData.data;

      // Save token to Firestore
      const tokenRef = doc(db, 'pushTokens', userId);
      await setDoc(tokenRef, {
        token,
        userId,
        platform: Platform.OS,
        updatedAt: new Date(),
      });

      return { success: true, token };
    }

    return { success: false, error: 'Not a valid platform for push notifications' };
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
        data: data || {},
        sound: true,
        badge: 1,
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
