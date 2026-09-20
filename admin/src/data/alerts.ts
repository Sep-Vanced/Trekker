export interface Alert {
  id: number;
  message: string;
  type: "Weather" | "Route" | "Checkpoint";
  time: string;
}

export const alerts: Alert[] = [
  {
    id: 1,
    message: "Heavy rainfall detected. Dangerous trail conditions.",
    type: "Weather",
    time: "2026-03-21T09:00:00",
  },
  {
    id: 2,
    message: "Approaching Camp Kuta. Prepare to turn left.",
    type: "Checkpoint",
    time: "2026-03-21T10:00:00",
  },
  {
    id: 3,
    message: "River crossing ahead. Use caution.",
    type: "Route",
    time: "2026-03-21T10:20:00",
  },
  {
    id: 4,
    message: "Camp Ridge Trail is currently closed.",
    type: "Route",
    time: "2026-03-21T08:30:00",
  },
];