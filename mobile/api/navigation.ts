import { Campsite, Checkpoint, TrekRoute, Vehicle, WeatherData } from "@/types/navigation-types";
import { api } from "./client";


// ─── Campsite endpoints ───────────────────────────────────────────────────────
 
export const getCampsites = () =>
  api.get<Campsite[]>("/navigation/campsite/");
 
export const getCampsiteById = (id: number) =>
  api.get<Campsite>(`/navigation/campsite/${id}/`);

export const getCheckpointsByRoute = (routeId: number) =>
  api.get<Checkpoint[]>(`/navigation/checkpoint/${routeId}/`);
 
// ─── Trek route endpoints ─────────────────────────────────────────────────────
 
export const getRoutesByCampsite = (campsiteId: number) =>
  api.get<TrekRoute[]>(`/navigation/trekroute/${campsiteId}/`);
 
export const getRouteById = (routeId: number) =>
  api.get<TrekRoute>(`/navigation/trekroute/detail/${routeId}/`);
 
// ─── Weather endpoint ─────────────────────────────────────────────────────────
 
export const getWeather = () =>
  api.get<WeatherData>("/navigation/weather/");
 
// ─── Vehicles endpoint ────────────────────────────────────────────────────────
 
export const getVehicles = () =>
  api.get<Vehicle[]>("/navigation/vehicles/");

