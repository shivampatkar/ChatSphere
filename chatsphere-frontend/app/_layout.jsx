import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import useAuthStore from "../store/useAuthStore";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const segments = useSegments();
  const router = useRouter();
  const [navigationReady, setNavigationReady] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNavigationReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !navigationReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/chat");
    }

    setAuthResolved(true);
  }, [isAuthenticated, hasHydrated, segments, navigationReady]);

  // Hide the native splash only after auth is resolved
  useEffect(() => {
    if (authResolved) {
      SplashScreen.hideAsync();
    }
  }, [authResolved]);

  // Return null (nothing renders) while splash is still visible
  if (!authResolved) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#1E3A8A" />
      <RootLayoutNav />
    </>
  );
}
