import { Stack, useRouter, useSegments } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { db } from "../config/firebase";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const back = "< back";

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

    // If user exists (signed in) and we're not already showing the auth screens,
    // check whether the user's profile document has a username. If not, send them
    // to the complete-profile screen to pick one.
    const checkProfile = async () => {
      try {
        if (user && !inAuthGroup) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const data = userDoc.exists() ? userDoc.data() : null;
          const username = data?.username;
          if (!username || String(username).trim().length === 0) {
            // If not already on complete-profile, navigate there
            router.replace("/complete-profile" as any);
          }
        }
      } catch (err) {
        // ignore — don't block routing on profile-check failures
        console.warn("Failed to check user profile:", err);
      }
    };

    checkProfile();
  }, [user, segments, isLoadingUser]);

  // Show nothing while loading
  if (isLoadingUser) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="currency"
        options={{
          headerTitle: "",
          headerBackTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel="Back"
              hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
            >
              <Text style={{ fontSize: 15 }}> {back} </Text>
            </TouchableOpacity>
          ) as any,
        }}
      />
      <Stack.Screen
        name="createGroup"
        options={{
          headerTitle: "",
          headerBackTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel="Back"
              hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
            >
              <Text style={{ fontSize: 15 }}> {back} </Text>
            </TouchableOpacity>
          ) as any,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <View style={{ flex: 1 }}>
          <RootLayoutNav />
        </View>
      </TouchableWithoutFeedback>
    </AuthProvider>
  );
}

