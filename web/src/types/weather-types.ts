export interface WeatherReport {
  condition: string;
  condition_display: string;
  temperature_c: string;
  wind_speed_kph: string;
  rainfall_mm: string;
  humidity_pct: number;
  is_safe_to_trek: boolean;
  recorded_at: string;
}

export interface RouteWeather {
  route: string;
  status: string;
  report: WeatherReport;
  alerts: string[];
  alert_count: number;
  has_danger: boolean;
}

export interface RefreshWeatherData {
  condition: string;
  temperature_c: string;
  wind_speed_kph: string;
  rainfall_mm: string;
  humidity_pct: string;
}

export interface RouteWeatherRefresh {
  route: string;
  is_safe: boolean;
  profile: string;
  weather: RefreshWeatherData;
  reasons: string[];
  alerts: string[];
}
