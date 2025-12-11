// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
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
