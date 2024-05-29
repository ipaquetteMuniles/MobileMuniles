import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="resetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="formation" options={{ headerShown: false }} />
        <Stack.Screen name="emailVerification" options={{ headerShown: false }} />
        <Stack.Screen name="selectPhotos" options={{ headerShown: false }} />
    </Stack>
  );
}