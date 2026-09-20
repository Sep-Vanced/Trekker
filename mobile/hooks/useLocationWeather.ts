import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LiveWeather {
  temperature: number;       // °C
  humidity: number;          // %
  windSpeed: number;         // km/h
  weatherCode: number;       // WMO code
  condition: string;         // human-readable
  icon: string;              // emoji
  status: "Safe" | "Caution" | "Danger";
  alerts: string[];
  latitude: number;
  longitude: number;
  locationName: string;      // reverse-geocoded place name
  updatedAt: Date;
}

export interface UseLocationWeatherResult {
  weather: LiveWeather | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── WMO weather code → label + emoji ────────────────────────────────────────
function decodeWMO(code: number): { condition: string; icon: string } {
  if (code === 0)              return { condition: "Clear Sky",            icon: "☀️"  };
  if (code === 1)              return { condition: "Mainly Clear",         icon: "🌤️" };
  if (code === 2)              return { condition: "Partly Cloudy",        icon: "⛅"  };
  if (code === 3)              return { condition: "Overcast",             icon: "☁️"  };
  if (code >= 45 && code <= 48) return { condition: "Foggy",              icon: "🌫️" };
  if (code >= 51 && code <= 55) return { condition: "Drizzle",            icon: "🌦️" };
  if (code >= 56 && code <= 57) return { condition: "Freezing Drizzle",   icon: "🌧️" };
  if (code >= 61 && code <= 65) return { condition: "Rain",               icon: "🌧️" };
  if (code >= 66 && code <= 67) return { condition: "Freezing Rain",      icon: "🌨️" };
  if (code >= 71 && code <= 77) return { condition: "Snowfall",           icon: "❄️"  };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers",       icon: "🌦️" };
  if (code === 85 || code === 86) return { condition: "Snow Showers",     icon: "🌨️" };
  if (code === 95)              return { condition: "Thunderstorm",        icon: "⛈️"  };
  if (code >= 96 && code <= 99) return { condition: "Thunderstorm w/ Hail", icon: "⛈️" };
  return { condition: "Unknown", icon: "🌡️" };
}

// ─── Derive trek safety status from conditions ────────────────────────────────
function deriveTrekStatus(
  code: number,
  windSpeed: number
): { status: LiveWeather["status"]; alerts: string[] } {
  const alerts: string[] = [];
  let status: LiveWeather["status"] = "Safe";

  // Thunderstorm / severe → Danger
  if (code >= 95) {
    status = "Danger";
    alerts.push("Active thunderstorm — trekking not recommended.");
  }
  // Heavy rain, freezing rain, snow → Danger
  else if (
    (code >= 64 && code <= 67) ||
    (code >= 75 && code <= 77) ||
    code === 86
  ) {
    status = "Danger";
    alerts.push("Heavy precipitation — trail conditions hazardous.");
  }
  // Light/moderate rain, showers → Caution
  else if (
    (code >= 51 && code <= 63) ||
    (code >= 80 && code <= 85)
  ) {
    status = "Caution";
    alerts.push("Rain expected — wear waterproof gear.");
  }
  // Fog → Caution
  else if (code >= 45 && code <= 48) {
    status = "Caution";
    alerts.push("Low visibility due to fog.");
  }

  // Wind check
  if (windSpeed >= 60) {
    status = "Danger";
    alerts.push(`Strong winds at ${windSpeed} km/h.`);
  } else if (windSpeed >= 35 && status === "Safe") {
    status = "Caution";
    alerts.push(`Elevated wind speed: ${windSpeed} km/h.`);
  }

  return { status, alerts };
}

// ─── Reverse geocode with Nominatim ──────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    // Prefer village/town/city, fall back to county
    return (
      data?.address?.village ||
      data?.address?.town ||
      data?.address?.city ||
      data?.address?.county ||
      "Your Location"
    );
  } catch {
    return "Your Location";
  }
}

// ─── Fetch weather from Open-Meteo ───────────────────────────────────────────
async function fetchWeather(lat: number, lng: number): Promise<LiveWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&wind_speed_unit=kmh` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();

  const current = data.current;
  const code: number = current.weather_code;
  const temp: number = Math.round(current.temperature_2m);
  const humidity: number = Math.round(current.relative_humidity_2m);
  const wind: number = Math.round(current.wind_speed_10m);

  const { condition, icon } = decodeWMO(code);
  const { status, alerts } = deriveTrekStatus(code, wind);
  const locationName = await reverseGeocode(lat, lng);

  return {
    temperature: temp,
    humidity,
    windSpeed: wind,
    weatherCode: code,
    condition,
    icon,
    status,
    alerts,
    latitude: lat,
    longitude: lng,
    locationName,
    updatedAt: new Date(),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Minimum distance (meters) before refetching weather on move
const MIN_DISTANCE_METERS = 500;

export function useLocationWeather(): UseLocationWeatherResult {
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastCoords = useRef<{ lat: number; lng: number } | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const haversineDistance = (
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const load = async (lat: number, lng: number) => {
    try {
      setError(null);
      const w = await fetchWeather(lat, lng);
      setWeather(w);
    } catch (err: any) {
      console.warn("[useLocationWeather] fetch error:", err);
      setError("Could not load weather for your location.");
    } finally {
      setLoading(false);
    }
  };

  const startWatching = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission required for live weather.");
      setLoading(false);
      return;
    }

    // Initial fetch
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = loc.coords;
      lastCoords.current = { lat, lng };
      await load(lat, lng);
    } catch {
      setLoading(false);
      setError("Could not get your current location.");
    }

    // Watch for significant movement
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: MIN_DISTANCE_METERS,
        timeInterval: 60_000, // also check every 60 s minimum
      },
      async (loc) => {
        const { latitude: lat, longitude: lng } = loc.coords;
        const last = lastCoords.current;

        if (last) {
          const dist = haversineDistance(last.lat, last.lng, lat, lng);
          if (dist < MIN_DISTANCE_METERS) return; // debounce
        }

        lastCoords.current = { lat, lng };
        await load(lat, lng);
      }
    );
  };

  const refresh = () => {
    if (lastCoords.current) {
      setLoading(true);
      load(lastCoords.current.lat, lastCoords.current.lng);
    } else {
      setLoading(true);
      startWatching();
    }
  };

  useEffect(() => {
    startWatching();
    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return { weather, loading, error, refresh };
}