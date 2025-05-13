
import React from 'react';
import { Slot, SplashScreen } from 'expo-router';
import { AuthProvider, useProtectedRoute } from '@/context/AuthContext'; // Adjust path as needed
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible until the DMs from the AI are ready to be sent to the client.
// SplashScreen.preventAutoHideAsync(); // It's often better to manage this within AuthProvider or a specific loading screen

function RootLayoutNav() {
  useProtectedRoute(); // Apply protected route logic globally

  return (
    <Slot />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
