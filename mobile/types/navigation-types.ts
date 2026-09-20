export interface Campsite {
  id: number;
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  phase: string;
  is_active: boolean;
}
 
export interface TrekRoute {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  difficulty_score: number;
  status: string;
  start_name: string;
  start_latitude: string;
  start_longitude: string;
  end_latitude: string;
  end_longitude: string;
  total_distance_km: string;
  estimated_hours: string;
  allowed_vehicles: string;
  elevation_gain_m: number;
  offline_map_file: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  destination: number;
}
 
export interface WeatherData {
  status: "Safe" | "Caution" | "Danger";
  condition: string;
  icon: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  alerts: string[];
  recommendation: string;
}
 
export interface Vehicle {
  id: string;
  name: string;
  icon: string;
  suitable: string[];
  restrictions: string[];
}

export interface Checkpoint {
  id: number;
  name: string;
  order: number;
  latitude: string;
  longitude: string;
  cp_type: "waypoint" | "danger" | "rest" | "camp" | "emergency";
  description: string;
  alert_message: string;
  radius_meters: number;
  is_mandatory: boolean;
  route: number;
}
 