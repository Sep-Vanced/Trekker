import { MapPin, Mountain, Waves, Eye } from "lucide-react";

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

export const visitorData: VisitorPoint[] = [
  { day: "Mon", mapanuepe: 42, pimmayong: 18 },
  { day: "Tue", mapanuepe: 38, pimmayong: 15 },
  { day: "Wed", mapanuepe: 55, pimmayong: 24 },
  { day: "Thu", mapanuepe: 47, pimmayong: 20 },
  { day: "Fri", mapanuepe: 88, pimmayong: 41 },
  { day: "Sat", mapanuepe: 134, pimmayong: 67 },
  { day: "Sun", mapanuepe: 112, pimmayong: 53 },
];

export const siteActivity: SiteActivityItem[] = [
  {
    name: "Mapanuepe Lake",
    barangay: "Brgy. Aglao",
    visitors: 134,
    capacity: 200,
    icon: <Waves size={13} />,
    color: "#0ea5e9",
  },
  {
    name: "Mt. Pimmayong",
    barangay: "Brgy. San Rafael",
    visitors: 67,
    capacity: 100,
    icon: <Mountain size={13} />,
    color: "#10b981",
  },
  {
    name: "Lahar Viewpoint",
    barangay: "Brgy. Poonbato",
    visitors: 29,
    capacity: 80,
    icon: <Eye size={13} />,
    color: "#a78bfa",
  },
  {
    name: "Upland Eco Trail",
    barangay: "Brgy. Nagbunga",
    visitors: 18,
    capacity: 60,
    icon: <MapPin size={13} />,
    color: "#f59e0b",
  },
];

export const recentAlerts: AlertItem[] = [
  {
    type: "warning",
    msg: "Heavy rain advisory – Mt. Pimmayong trail",
    time: "14 min ago",
    color: "#f59e0b",
  },
  {
    type: "emergency",
    msg: "Lahar flow detected near Mapanuepe outlet",
    time: "1 hr ago",
    color: "#ef4444",
  },
  {
    type: "info",
    msg: "Capacity nearing limit at Mapanuepe campsite",
    time: "2 hr ago",
    color: "#0ea5e9",
  },
];

export const mapSites: MapSite[] = [
  {
    name: "Mapanuepe Lake",
    lat: 15.045, // Northern part within hazard polygon
    lng: 120.20,
    color: "#A3B18A",
    visitors: 134,
    type: "Eco-Tourism / Camping",
    status: "Open",
  },
  {
    name: "Mt. Pimmayong",
    lat: 15.01, // Central northern slope
    lng: 120.18,
    color: "#588157",
    visitors: 67,
    type: "Trekking / Hiking",
    status: "Rain Advisory",
  },
  {
    name: "Lahar Viewpoint",
    lat: 14.985, // Near southern edge
    lng: 120.23,
    color: "#3A5A40",
    visitors: 29,
    type: "Scenic Viewpoint",
    status: "Open",
  },
  {
    name: "Upland Eco Trail",
    lat: 14.97, // South-west within polygon
    lng: 120.16,
    color: "#344E41",
    visitors: 18,
    type: "Nature Trail",
    status: "Open",
  },
  {
    name: "San Marcelino Town Hall",
    lat: 14.9741, // Exact center coords
    lng: 120.1557,
    color: "#344E41",
    visitors: 0,
    type: "LGU / Municipal Hall",
    status: "HQ",
  },
];
