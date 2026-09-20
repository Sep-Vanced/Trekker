export type RouteDifficulty = "Easy" | "Moderate" | "Hard";
export type RouteStatus = "Open" | "Closed";

export interface Checkpoint {
  id: number;
  name: string;
  distanceFromStart: number; // meters
}

export interface Route {
  id: number;
  name: string;
  distance: number; 
  estimatedTime: number;
  elevation: number; 
  difficulty: RouteDifficulty;
  status: RouteStatus;
  checkpoints: Checkpoint[];
}