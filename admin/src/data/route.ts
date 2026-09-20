import type { Route } from "@/types/route";

export const routes: Route[] = [
  {
    id: 1,
    name: "Camp Kuta Trail",
    distance: 5,
    estimatedTime: 180,
    elevation: 500,
    difficulty: "Moderate",
    status: "Open",
    checkpoints: [
      { id: 1, name: "River Crossing", distanceFromStart: 1000 },
      { id: 2, name: "Hilltop View", distanceFromStart: 3000 },
      { id: 3, name: "Camp Entrance", distanceFromStart: 4800 },
    ],
  },
  {
    id: 2,
    name: "Camp Ridge Trail",
    distance: 8,
    estimatedTime: 300,
    elevation: 900,
    difficulty: "Hard",
    status: "Closed",
    checkpoints: [
      { id: 1, name: "Steep Cliff", distanceFromStart: 2000 },
      { id: 2, name: "Rocky Path", distanceFromStart: 5000 },
    ],
  },
  {
    id: 3,
    name: "Camp Sierra Trail",
    distance: 6,
    estimatedTime: 220,
    elevation: 650,
    difficulty: "Moderate",
    status: "Open",
    checkpoints: [
      { id: 1, name: "Forest Entry", distanceFromStart: 800 },
      { id: 2, name: "Waterfall", distanceFromStart: 3500 },
    ],
  },
  {
    id: 4,
    name: "Camp Verde Trail",
    distance: 4,
    estimatedTime: 120,
    elevation: 300,
    difficulty: "Easy",
    status: "Open",
    checkpoints: [
      { id: 1, name: "Bridge", distanceFromStart: 500 },
      { id: 2, name: "Green Field", distanceFromStart: 2500 },
    ],
  },
];