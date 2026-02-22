# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up push notifications using Firebase Cloud Messaging and Expo Notifications.

## Prerequisites

- Firebase project already configured (✓)
- Expo account and project (✓)
- `expo-notifications` package installed (✓)

## Step 1: Firebase Console Setup

### For Android:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jimatbite**
3. Click the Settings gear icon → **Project settings**
4. Go to the **Cloud Messaging** tab
5. Under **Cloud Messaging API (Legacy)**, note your **Server Key** (you'll need this for backend)
6. Download the `google-services.json` file from **General** tab
7. Place it in the root of your project: `c:\React Projects\JimatBite\JimatBiteApp\google-services.json`

### For iOS:
1. In Firebase Console → **Project settings**
2. Go to **Cloud Messaging** tab
3. Under **Apple app configuration**, upload your APNs authentication key or certificate
4. Download the `GoogleService-Info.plist` file
5. Place it in the root of your project

### Enable Cloud Messaging API (V1):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** → **Library**
4. Search for "Firebase Cloud Messaging API"
5. Click **Enable**

## Step 2: Install Additional Dependencies (if needed)

```bash
npx expo install expo-device
```

## Step 3: Firestore Security Rules

Add these rules to allow storing device tokens:

```javascript
// Firestore Rules
match /deviceTokens/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Step 4: Integrate Notifications in Your App

### A. In your main app layout (`app/_layout.tsx`):

```typescript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { getCurrentUser } from '../services/auth';
import { 
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse
} from '../services/notifications';

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications when user logs in
    const setupNotifications = async () => {
      const user = getCurrentUser();
      if (user) {
        const result = await registerForPushNotifications(user.uid);
        if (result.success) {
          console.log('Notifications registered successfully');
        } else {
          console.log('Notification registration failed:', result.error);
        }
      }
    };

    setupNotifications();

    // Handle notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // You can show a custom in-app notification here
    });

    // Handle notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      
      // Navigate based on notification type
      if (data.screen) {
        router.push(data.screen as any);
      }
      if (data.orderId) {
        router.push({
          pathname: '/order-details',
          params: { orderId: data.orderId }
        });
      }
    });

    // Check if app was opened from a notification
    getLastNotificationResponse().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        // Handle navigation
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // ... rest of your layout
}
```

### B. Send notifications when orders are created:

```typescript
import { sendOrderConfirmationNotification } from '../services/notifications';

// After creating an order
const result = await createOrder(orderData);
if (result.success) {
  await sendOrderConfirmationNotification(
    result.orderId,
    totalAmount,
    itemCount
  );
}
```

### C. Send notifications when order status changes:

```typescript
import { sendOrderStatusNotification } from '../services/notifications';

// When merchant updates order status
await sendOrderStatusNotification(
  orderId,
  'preparing', // or 'confirmed', 'on-the-way', 'delivered'
  'JimatBite Restaurant'
);
```

## Step 5: Testing Notifications

### Test with Expo Push Tool:
1. Run your app and register for notifications
2. Copy the Expo push token from the console
3. Go to [Expo Push Notification Tool](https://expo.dev/notifications)
4. Paste your token
5. Write a message and send

### Test with Firebase Console:
1. Go to Firebase Console → **Cloud Messaging**
2. Click **Send your first message**
3. Enter title and body
4. Click **Send test message**
5. Enter your FCM token or Expo push token
6. Click **Test**

## Step 6: Backend Integration (Optional)

To send notifications from your backend:

### Using Expo Push Service:

```javascript
const sendPushNotification = async (expoPushToken, title, body, data) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
```

### Using Firebase Admin SDK (Node.js):

```javascript
const admin = require('firebase-admin');

// Initialize with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send to specific token
async function sendNotification(token, title, body, data) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    token: token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.log('Error sending message:', error);
  }
}
```

## Step 7: Notification Icon and Sound (Optional)

1. Create a notification icon: `assets/images/notification-icon.png` (96x96px, white on transparent)
2. Add notification sound: `assets/sounds/notification.wav`

## Step 8: Build and Deploy

### For Development:
```bash
npx expo start
```

### For Production Build:
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Troubleshooting

### Issue: "Permission not granted"
- Make sure you're testing on a physical device
- Check app permissions in device settings

### Issue: "Project ID not found"
- Verify `extra.eas.projectId` is set in app.json (✓)
- Make sure you're logged into Expo CLI

### Issue: Notifications not showing on Android
- Ensure `google-services.json` is in the project root
- Verify notification channel is created (done automatically)
- Check if app has notification permissions

### Issue: Notifications not showing on iOS
- Upload APNs key/certificate to Firebase
- Test on physical device (not simulator)
- Check notification permissions

## Production Checklist

- [ ] Firebase Cloud Messaging API enabled
- [ ] `google-services.json` added (Android)
- [ ] `GoogleService-Info.plist` added (iOS)
- [ ] APNs certificate/key uploaded (iOS)
- [ ] Firestore security rules updated
- [ ] Notification permissions requested
- [ ] Device tokens saved to Firestore
- [ ] Backend integration completed (if applicable)
- [ ] Tested on physical devices

## Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Push Notification Tool](https://expo.dev/notifications)
