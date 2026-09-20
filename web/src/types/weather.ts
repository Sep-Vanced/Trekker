 // ─── OpenWeatherMap raw response types ────────────────────────

export interface OwmWeatherItem {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OwmMain {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
}

export interface OwmWind {
  speed: number;
  deg: number;
}

export interface OwmRain {
  "1h"?: number;
  "3h"?: number;
}

export interface OwmCurrentResponse {
  weather: OwmWeatherItem[];
  main: OwmMain;
  wind: OwmWind;
  rain?: OwmRain;
}

export interface OwmForecastSlot {
  dt: number;
  main: OwmMain;
  wind: OwmWind;
  rain?: OwmRain;
  weather: OwmWeatherItem[];
  dt_txt: string;
}

export interface OwmForecastResponse {
  list: OwmForecastSlot[];
}

// ─── Parsed/internal types ────────────────────────────────────

export interface ParsedWeather {
  condition: string;
  temperature_c: number;
  wind_speed_kph: number;
  rainfall_mm: number;
  humidity_pct: number;
}

export interface ParsedForecastSlot {
  rain_3h: number;
  wind_kph: number;
  weather_id: number;
  dt_txt: string;
}

export interface AlertPayload {
  alert_type: string;
  severity: string;
  title: string;
  message: string;
}

export interface EvaluationResult {
  is_safe: boolean;
  profile: string;
  reasons: string[];
  alerts: AlertPayload[];
}

export interface RouteWeatherResult {
  route: string;
  is_safe: boolean;
  profile: string;
  weather: ParsedWeather;
  reasons: string[];
  alerts: AlertPayload[];
}

export interface WeatherUpdateSummary {
  success: boolean;
  reason?: string;
  condition?: string;
  temperature_c?: number;
  rainfall_mm?: number;
  wind_speed_kph?: number;
  routes_updated?: number;
  routes_closed?: number;
  routes_caution?: number;
  alerts_created?: number;
}