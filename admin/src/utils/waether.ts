import type { Weather } from "@/types/weather";
import type { WeatherLevel } from "@/types/weather"; // or reuse if already defined elsewhere

export const getWeatherLevel = (data: Weather): WeatherLevel => {
  if (data.rainfall > 60 || data.riverLevel > 3.5) {
    return "Danger";
  }

  if (data.rainfall > 30 || data.riverLevel > 2.8) {
    return "Warning";
  }

  return "Safe";
};