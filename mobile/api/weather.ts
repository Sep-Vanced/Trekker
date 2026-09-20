import { api } from "./client";
import { RouteWeather, RouteWeatherRefresh } from "@/types/weather-types";

// ─── Get current weather for a route ──────────────────────────────────────────
export const getRouteWeather = (routeId: number) =>
  api.get<RouteWeather>(`/weather/routes/${routeId}/`);

// ─── Refresh/recalculate weather for a route ──────────────────────────────────
// Call this every time the user taps "Check This Route"
export const refreshRouteWeather = (routeId: number) =>
  api.get<RouteWeatherRefresh>(`/weather/routes/${routeId}/refresh/`);