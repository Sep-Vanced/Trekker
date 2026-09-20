export type WeatherLevel = "Safe" | "Warning" | "Danger";

export type WeatherCondition =
  | "Clear"
  | "Cloudy"
  | "Rain"
  | "Storm";

export interface Weather {
  id: number;
  routeName: string;
  temperature: number;
  rainfall: number;
  windSpeed: number;
  riverLevel: number; 
  condition: WeatherCondition;
  lat: number;
  lng: number;
}

export interface WeatherLog {
  id: number;
  time: string;
  rainfall: number;
  riverLevel: number;
  temperature?: number;
  windSpeed?: number;
}

export interface WeatherMetrics {
  avgTemperature: number;
  totalRainfall: number;
  avgWindSpeed: number;
  maxRiverLevel: number;
  overallRisk: "Safe" | "Warning" | "Danger";
}