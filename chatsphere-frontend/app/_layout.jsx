import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import useAuthStore from "../store/useAuthStore";
import { ToastProvider } from "../components/Toast";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const segments = useSegments();
  const router = useRouter();
  const [navigationReady, setNavigationReady] = useState(false);

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

    SplashScreen.hideAsync();
  }, [isAuthenticated, hasHydrated, segments, navigationReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ToastProvider>
      <StatusBar style="light" backgroundColor="#1E3A8A" />
      <RootLayoutNav />
    </ToastProvider>
  );
}
