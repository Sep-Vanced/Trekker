import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="campsite-routes" />
      <Stack.Screen name="camp-detail" />
      <Stack.Screen name="trek-start" />
      <Stack.Screen name="vehicle-check" />
      <Stack.Screen name="weather-detail" />
      <Stack.Screen name="emergency" />
    </Stack>
  );
}