// app/_layout.tsx
import * as Notifications from 'expo-notifications';
import { Stack, router } from "expo-router";
import { useEffect, useRef } from "react";
import { getCurrentUser } from '../services/auth';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  registerForPushNotifications
} from '../services/notifications';

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Register for push notifications when component mounts
    const setupNotifications = async () => {
      const user = getCurrentUser();
      if (user) {
        const result = await registerForPushNotifications(user.uid);
        if (result.success) {
          console.log('✓ Notifications registered successfully');
          console.log('Push token:', result.token);
        } else {
          console.log('✗ Notification registration failed:', result.error);
        }
      }
    };

    setupNotifications();

    // Handle notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      // Notification will be displayed automatically
    });

    // Handle notification taps (when user interacts with notification)
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('👆 Notification tapped:', data);
      
      // Navigate based on notification type and data
      if (data.type === 'order_confirmation' || data.type === 'order_status') {
        if (data.orderId) {
          router.push({
            pathname: '/order-details' as any,
            params: { orderId: String(data.orderId) }
          });
        }
      } else if (data.screen) {
        router.push(data.screen as any);
      }
    });

    // Check if app was opened from a notification (when app was closed)
    getLastNotificationResponse().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        console.log('📱 App opened from notification:', data);
        // Handle navigation based on notification data
        if (data.orderId) {
          router.push({
            pathname: '/order-details' as any,
            params: { orderId: String(data.orderId) }
          });
        }
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="set-password" />
      <Stack.Screen name="fingerprint" />
      <Stack.Screen name="category-blindbox" options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="category-meal" options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="category-vegan" options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="category-dessert" options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="category-drink" options={{ animation: 'fade', animationDuration: 150 }} />
      <Stack.Screen name="myorders-active" options={{ animation: 'none' }} />
      <Stack.Screen name="myorders-completed" options={{ animation: 'none' }} />
      <Stack.Screen name="myorders-cancelled" options={{ animation: 'none' }} />
    </Stack>
  );
}
