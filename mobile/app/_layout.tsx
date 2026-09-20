import "./global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../constants/AuthContext";
import { TrekProvider } from "../constants/TrekContext";
import { useRouter, useSegments } from "expo-router";

function RootGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuth    = segments[0] === "auth";
    const inTabs    = segments[0] === "(tabs)";
    const inRanger  = segments[0] === "(ranger)";

    if (!user && !inAuth) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user && inAuth) {
      // Redirect to the correct home based on role
      if (user.role === "ranger") {
        router.replace("/(ranger)/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
      return;
    }

    // Prevent a ranger from accessing trekker tabs and vice versa
    if (user && inTabs && user.role === "ranger") {
      router.replace("/(ranger)/dashboard");
      return;
    }

    if (user && inRanger && user.role !== "ranger") {
      router.replace("/(tabs)/home");
      return;
    }
  }, [user, isLoading, segments]);

  return null;
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <RootGuard />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="screens" />
        <Stack.Screen name="(ranger)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <TrekProvider>
          <AppContent />
        </TrekProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}