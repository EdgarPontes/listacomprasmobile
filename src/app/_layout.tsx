import '../../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/auth/AuthContext';

void SplashScreen.preventAutoHideAsync();

function SplashController() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  return null;
}

function RootNavigator() {
  const { status } = useAuth();
  const signedIn = status === 'signedIn';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn} redirectTo="/login">
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SplashController />
          <StatusBar style="auto" />
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
