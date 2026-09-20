export interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendVal?: string;
  accent: string;
  glow: string;
  alert?: boolean;
}

export interface VisitorPoint {
  day: string;
  mapanuepe: number;
  pimmayong: number;
}

export interface SiteActivityItem {
  name: string;
  barangay: string;
  visitors: number;
  capacity: number;
  icon: React.ReactNode;
  color: string;
}

export interface AlertItem {
  type: string;
  msg: string;
  time: string;
  color: string;
}

export interface MapSite {
  name: string;
  lat: number;
  lng: number;
  color: string;
  visitors: number;
  type: string;
  status: string;
}