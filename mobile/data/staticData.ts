// ─────────────────────────────────────────────
//  STATIC DATA  –  Mapanuepe Lake Trekking App
// ─────────────────────────────────────────────

export type Camp = {
  id: string;
  name: string;
  description: string;
  distance: number; // km from starting point
  elevationGain: number; // meters
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert";
  estimatedTime: string;
  amenities: string[];
  coordinates: { latitude: number; longitude: number };
  imageUri: string;
  color: string;
};

export type Checkpoint = {
  id: string;
  campId: string;
  name: string;
  description: string;
  distanceFromStart: number; // km
  type: "start" | "waypoint" | "danger" | "river" | "camp";
  coordinates: { latitude: number; longitude: number };
  alert?: string;
};

export type WeatherCondition = {
  status: "Safe" | "Caution" | "Danger";
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  condition: string;
  icon: string;
  alerts: string[];
  recommendation: string;
  lastUpdated: string;
};

export type Vehicle = {
  id: string;
  name: string;
  icon: string;
  minClearance: number; // cm
  suitable: string[]; // camp IDs it can reach
  restrictions: string[];
};

export type EmergencyContact = {
  name: string;
  role: string;
  number: string;
};

// ── STARTING POINT ────────────────────────────────────────────────────────────
export const STARTING_POINT = {
  name: "Mapanuepe Lake Trailhead",
  barangay: "Aglao",
  municipality: "San Marcelino",
  province: "Zambales",
  coordinates: { latitude: 15.0312, longitude: 120.1087 },
  description:
    "Main entry point for all trekking routes inside Mapanuepe Lake. Registration is required before entering.",
};

// ── CAMPS ─────────────────────────────────────────────────────────────────────
export const CAMPS: Camp[] = [
  {
    id: "camp_kuta",
    name: "Camp Kuta",
    description:
      "The nearest and most accessible camp. Ideal for beginners and day-trippers. Offers a stunning view of the submerged church tower of Mapanuepe.",
    distance: 2.4,
    elevationGain: 85,
    difficulty: "Easy",
    estimatedTime: "45-60 mins",
    amenities: ["Restroom", "Picnic Area", "Water Source", "Campsite"],
    coordinates: { latitude: 15.0401, longitude: 120.1154 },
    imageUri: "camp_kuta",
    color: "#22c55e",
  },
  {
    id: "camp_rizal",
    name: "Camp Rizal",
    description:
      "Mid-trail camp perched on a ridge with panoramic views of the lake and surrounding mountains. Moderate trek through dense forest.",
    distance: 4.8,
    elevationGain: 210,
    difficulty: "Moderate",
    estimatedTime: "1.5-2 hrs",
    amenities: ["Restroom", "Campsite", "Observation Deck"],
    coordinates: { latitude: 15.0523, longitude: 120.1203 },
    imageUri: "camp_rizal",
    color: "#3b82f6",
  },
  {
    id: "camp_silangan",
    name: "Camp Silangan",
    description:
      "Remote camp on the eastern ridge. Rewards trekkers with sunrise views over Mapanuepe Lake. Requires river crossing.",
    distance: 7.2,
    elevationGain: 380,
    difficulty: "Hard",
    estimatedTime: "3-4 hrs",
    amenities: ["Basic Campsite", "Natural Spring"],
    coordinates: { latitude: 15.0634, longitude: 120.1312 },
    imageUri: "camp_silangan",
    color: "#f97316",
  },
  {
    id: "camp_bundok",
    name: "Camp Bundok",
    description:
      "Summit camp. The most challenging route. Only for experienced trekkers with proper equipment. Requires guide.",
    distance: 10.5,
    elevationGain: 620,
    difficulty: "Expert",
    estimatedTime: "5-7 hrs",
    amenities: ["Emergency Shelter"],
    coordinates: { latitude: 15.0789, longitude: 120.1445 },
    imageUri: "camp_bundok",
    color: "#ef4444",
  },
];

// ── CHECKPOINTS PER CAMP ──────────────────────────────────────────────────────
export const CHECKPOINTS: Checkpoint[] = [
  // --- Camp Kuta Route ---
  {
    id: "ck_start",
    campId: "camp_kuta",
    name: "Trailhead Gate",
    description: "Begin your trek here. Sign the logbook.",
    distanceFromStart: 0,
    type: "start",
    coordinates: { latitude: 15.0312, longitude: 120.1087 },
  },
  {
    id: "ck_1",
    campId: "camp_kuta",
    name: "Bamboo Forest",
    description: "Enter the bamboo grove. Stay on the marked path.",
    distanceFromStart: 0.8,
    type: "waypoint",
    coordinates: { latitude: 15.0345, longitude: 120.111 },
    alert: "📍 Entering bamboo forest. Watch for loose rocks underfoot.",
  },
  {
    id: "ck_2",
    campId: "camp_kuta",
    name: "Stream Crossing #1",
    description: "Shallow stream — passable on foot. Check depth after rain.",
    distanceFromStart: 1.5,
    type: "river",
    coordinates: { latitude: 15.0372, longitude: 120.1132 },
    alert: "🌊 River crossing ahead. Check water level before crossing.",
  },
  {
    id: "ck_3",
    campId: "camp_kuta",
    name: "Camp Kuta Entrance",
    description: "You have arrived at Camp Kuta!",
    distanceFromStart: 2.4,
    type: "camp",
    coordinates: { latitude: 15.0401, longitude: 120.1154 },
    alert: "🏕️ Welcome to Camp Kuta! You have reached your destination.",
  },

  // --- Camp Rizal Route ---
  {
    id: "cr_start",
    campId: "camp_rizal",
    name: "Trailhead Gate",
    description: "Begin your trek here. Sign the logbook.",
    distanceFromStart: 0,
    type: "start",
    coordinates: { latitude: 15.0312, longitude: 120.1087 },
  },
  {
    id: "cr_1",
    campId: "camp_rizal",
    name: "Bamboo Forest",
    description: "Enter the bamboo grove.",
    distanceFromStart: 0.8,
    type: "waypoint",
    coordinates: { latitude: 15.0345, longitude: 120.111 },
  },
  {
    id: "cr_2",
    campId: "camp_rizal",
    name: "Stream Crossing #1",
    description: "Shallow stream crossing.",
    distanceFromStart: 1.5,
    type: "river",
    coordinates: { latitude: 15.0372, longitude: 120.1132 },
    alert: "🌊 River crossing ahead. Check water level before crossing.",
  },
  {
    id: "cr_3",
    campId: "camp_rizal",
    name: "Camp Kuta Junction",
    description: "Turn right for Camp Rizal trail.",
    distanceFromStart: 2.4,
    type: "waypoint",
    coordinates: { latitude: 15.0401, longitude: 120.1154 },
    alert: "↗️ Keep right at the junction for Camp Rizal trail.",
  },
  {
    id: "cr_4",
    campId: "camp_rizal",
    name: "Rocky Ridge",
    description: "Steep rocky section. Use the rope guide provided.",
    distanceFromStart: 3.6,
    type: "danger",
    coordinates: { latitude: 15.0468, longitude: 120.1183 },
    alert: "⚠️ Steep rocky section ahead. Use the guide rope. Go slow.",
  },
  {
    id: "cr_5",
    campId: "camp_rizal",
    name: "Camp Rizal Entrance",
    description: "You have arrived at Camp Rizal!",
    distanceFromStart: 4.8,
    type: "camp",
    coordinates: { latitude: 15.0523, longitude: 120.1203 },
    alert: "🏕️ Welcome to Camp Rizal! Enjoy the panoramic view.",
  },

  // --- Camp Silangan Route ---
  {
    id: "cs_1",
    campId: "camp_silangan",
    name: "Trailhead Gate",
    description: "Begin your trek here.",
    distanceFromStart: 0,
    type: "start",
    coordinates: { latitude: 15.0312, longitude: 120.1087 },
  },
  {
    id: "cs_2",
    campId: "camp_silangan",
    name: "Major River Crossing",
    description: "Deep river. Motor crossing required during dry season.",
    distanceFromStart: 3.1,
    type: "river",
    coordinates: { latitude: 15.043, longitude: 120.116 },
    alert:
      "🌊 Major river crossing. During rainy season, this may be impassable. Proceed with extreme caution.",
  },
  {
    id: "cs_3",
    campId: "camp_silangan",
    name: "Cliff Trail",
    description: "Narrow trail along cliff edge. Single file only.",
    distanceFromStart: 5.4,
    type: "danger",
    coordinates: { latitude: 15.055, longitude: 120.1255 },
    alert: "⚠️ Cliff edge trail! Single file only. Do not look down. Hold the safety rope.",
  },
  {
    id: "cs_4",
    campId: "camp_silangan",
    name: "Camp Silangan",
    description: "You have arrived!",
    distanceFromStart: 7.2,
    type: "camp",
    coordinates: { latitude: 15.0634, longitude: 120.1312 },
    alert: "🏕️ Welcome to Camp Silangan! Sunrise views are best at 5:30 AM.",
  },
];

// ── WEATHER (STATIC MOCK DATA) ────────────────────────────────────────────────
export const WEATHER_DATA: WeatherCondition = {
  status: "Caution",
  temperature: 28,
  humidity: 82,
  windSpeed: 18,
  rainfall: 3.2,
  condition: "Partly Cloudy with Scattered Showers",
  icon: "⛅",
  alerts: [
    "Light rain expected in the afternoon (2PM–5PM)",
    "River water levels are elevated — check crossings",
    "Wind gusts possible near ridgelines",
  ],
  recommendation:
    "Trekking is possible but proceed with caution. Avoid river crossings after 2PM. Bring rain gear.",
  lastUpdated: "Today, 8:00 AM",
};

export const WEATHER_SCENARIOS = {
  safe: {
    status: "Safe" as const,
    temperature: 26,
    humidity: 65,
    windSpeed: 8,
    rainfall: 0,
    condition: "Sunny and Clear",
    icon: "☀️",
    alerts: [],
    recommendation: "Excellent trekking conditions. All routes are open.",
    lastUpdated: "Today, 8:00 AM",
  },
  caution: {
    status: "Caution" as const,
    temperature: 28,
    humidity: 82,
    windSpeed: 18,
    rainfall: 3.2,
    condition: "Partly Cloudy with Scattered Showers",
    icon: "⛅",
    alerts: [
      "Light rain expected in the afternoon (2PM–5PM)",
      "River water levels are elevated — check crossings",
      "Wind gusts possible near ridgelines",
    ],
    recommendation:
      "Trekking is possible but proceed with caution. Avoid river crossings after 2PM. Bring rain gear.",
    lastUpdated: "Today, 8:00 AM",
  },
  danger: {
    status: "Danger" as const,
    temperature: 24,
    humidity: 95,
    windSpeed: 45,
    rainfall: 28,
    condition: "Typhoon Warning - Heavy Rainfall",
    icon: "🌀",
    alerts: [
      "TYPHOON WARNING: Signal No. 1 in Zambales",
      "All river crossings are dangerous and impassable",
      "Flash flood risk in low-lying areas",
      "Strong winds — risk of falling trees and landslides",
    ],
    recommendation:
      "DO NOT TREK. All routes are CLOSED. Seek shelter immediately and contact local authorities.",
    lastUpdated: "Today, 8:00 AM",
  },
};

// ── VEHICLES ──────────────────────────────────────────────────────────────────
export const VEHICLES: Vehicle[] = [
  {
    id: "motorcycle",
    name: "Motorcycle / Habal-habal",
    icon: "🏍️",
    minClearance: 20,
    suitable: ["camp_kuta", "camp_rizal"],
    restrictions: [
      "Not recommended during heavy rain",
      "Cannot reach Camp Silangan and Camp Bundok",
      "Requires experienced trail rider",
    ],
  },
  {
    id: "4x4",
    name: "4x4 Vehicle",
    icon: "🚙",
    minClearance: 35,
    suitable: ["camp_kuta", "camp_rizal", "camp_silangan"],
    restrictions: [
      "Cannot pass narrow cliff trail to Camp Bundok",
      "River crossing depth limit: 70cm",
    ],
  },
  {
    id: "suv",
    name: "SUV",
    icon: "🚗",
    minClearance: 22,
    suitable: ["camp_kuta"],
    restrictions: [
      "Only suitable for Camp Kuta route",
      "Avoid during rainy season",
      "Not recommended for river crossings",
    ],
  },
  {
    id: "sedan",
    name: "Sedan",
    icon: "🚘",
    minClearance: 12,
    suitable: [],
    restrictions: [
      "❌ NOT recommended for any route",
      "Insufficient ground clearance",
      "Park at trailhead and proceed on foot",
    ],
  },
  {
    id: "foot",
    name: "On Foot / Hiking",
    icon: "🥾",
    minClearance: 0,
    suitable: ["camp_kuta", "camp_rizal", "camp_silangan", "camp_bundok"],
    restrictions: ["All routes accessible on foot", "Proper footwear required for Camp Bundok"],
  },
];

// ── EMERGENCY CONTACTS ────────────────────────────────────────────────────────
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: "San Marcelino MDRRMO",
    role: "Municipal Disaster Risk Reduction",
    number: "0908-888-3776",
  },
  {
    name: "San Marcelino Health Office",
    role: "Health Emergencies",
    number: "0916-270-7178",
  },
  {
    name: "PNP San Marcelino",
    role: "Police Emergencies",
    number: "0998-598-5506",
  },
  {
    name: "BFP San Marcelino",
    role: "Fire & Rescue",
    number: "0951-118-6269",
  },
];

// ── DASHBOARD STATS (mock for Tourism Office) ─────────────────────────────────
export const DASHBOARD_STATS = {
  visitorsToday: 47,
  activeTrekkers: 23,
  registeredThisWeek: 189,
  incidentsThisMonth: 1,
  mostPopularCamp: "Camp Kuta",
  routeStatus: {
    camp_kuta: "Open",
    camp_rizal: "Open",
    camp_silangan: "Caution",
    camp_bundok: "Closed",
  } as Record<string, "Open" | "Caution" | "Closed">,
};

// ── TREK PROGRESS (mock active session) ──────────────────────────────────────
export const MOCK_TREK_SESSION = {
  campId: "camp_kuta",
  startTime: "08:30 AM",
  distanceTraveled: 1.2,
  distanceRemaining: 1.2,
  steps: 1840,
  elevationGained: 42,
  currentSpeed: 3.2,
  estimatedArrival: "09:15 AM",
  nextCheckpoint: CHECKPOINTS.find((c) => c.id === "ck_2")!,
};