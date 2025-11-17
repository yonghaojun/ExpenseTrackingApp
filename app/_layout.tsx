import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    // If still loading auth state, don't redirect yet
    if (isLoadingUser) {
      return;
    }

    // If no user and not in auth group, redirect to auth
    if (!user && !inAuthGroup) {
      router.replace("/auth");
    }
    // If user exists and in auth group, redirect to home
    else if (user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, segments, isLoadingUser]);

  // Show nothing while loading
  if (isLoadingUser) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

