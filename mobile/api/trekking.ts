import {
  CreateSessionResponse,
  TourismRegistration,
  TourismRegistrationPayload,
  TrekkingSession,
  TrekkingSessionPayload,
} from "@/types/trekking-types";
import { api } from "./client";

// ─── Tourism Registration ────────────────────────────────────────────────────

/** Register a trekker for a route before starting */
export const registerTrekker = (payload: TourismRegistrationPayload) =>
  api.post<TourismRegistration>("/tourism/register/", payload);

/** Get QR code URL for a registration */
export const getRegistrationQrUrl = (registrationNumber: string): string =>
  `/tourism/registrations/${registrationNumber}/qr/`;

/** Get all active/upcoming registrations for the authenticated user */
export const getMyRegistrations = () =>
  api.get<{ count: number; results: MyRegistration[] }>(
    "/tourism/my-registrations/"
  );

/** Get past/historical registrations for the authenticated user */
export const getMyRegistrationHistory = () =>
  api.get<{ count: number; results: MyRegistration[] }>(
    "/tourism/my-registrations/history/"
  );

/** Get full details of a single registration by permit number */
export const getRegistrationByPermit = (permitNumber: string) =>
  api.get<RegistrationDetailType>(`/tourism/registrations/${permitNumber}/`);

/** Regenerate QR code for a registration (POST) */
export const regenerateQrCode = (permitNumber: string) =>
  api.post<{ success: boolean; qr_code: string; message: string }>(
    `/tourism/registrations/${permitNumber}/qr/`
  );

// ─── Trekking Session ────────────────────────────────────────────────────────

/** Create a new trekking session */
export const createTrekkingSession = (payload: TrekkingSessionPayload) =>
  api.post<CreateSessionResponse>("/user/trekking-session/", payload);

/** Get all trekking sessions of the authenticated user */
export const getTrekkingSessions = () =>
  api.get<TrekkingSession[]>("/user/trekking-session/");

/** Get a single trekking session by ID */
export const getSessionById = (sessionId: number) =>
  api.get<TrekkingSession>(`/user/trekking-session/${sessionId}/`);

/** Get active trekking session for a specific route */
export const getActiveSessionForRoute = async (
  routeId: number
): Promise<TrekkingSession | null> => {
  const res = await getTrekkingSessions();
  return (
    res.data.find(
      (session) => session.route === routeId && session.is_active
    ) ?? null
  );
};

/** End a trekking session by setting ended_at (PUT) */
export const endTrekkingSession = (sessionId: number, endedAt: string) =>
  api.put<TrekkingSession>(`/user/trekking-session/${sessionId}/`, {
    ended_at: endedAt,
  });

// ─── Location Log ────────────────────────────────────────────────────────────

export interface LocationLog {
  id: number;
  latitude: string;
  longitude: string;
  recorded_at: string;
  session: number;
}

export interface LocationLogPayload {
  session: number;
  latitude: number;
  longitude: number;
}

/** Log the user's current GPS location for a session (POST) */
export const logLocation = (payload: LocationLogPayload) =>
  api.post<LocationLog>("/user/location-log/", payload);

/** Get all location logs for a session (GET) */
export const getLocationLogs = (sessionId: number) =>
  api.get<LocationLog[]>(`/user/location-log/${sessionId}/`);

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface MyRegistration {
  id: number;
  permit_number: string;
  full_name: string;
  route_name: string;
  status: string;
  group_size: number;
  planned_entry: string;
  planned_exit: string;
  actual_entry: string | null;
  actual_exit: string | null;
  is_overdue: boolean;
  registered_at: string;
}

export interface RegistrationDetailType {
  id: number;
  permit_number: string;
  profile_id: number;
  full_name: string;
  route: {
    id: number;
    name: string;
    difficulty: string;
    status: string;
    total_distance_km: string;
  };
  status: string;
  group_size: number;
  planned_entry: string;
  planned_exit: string;
  actual_entry: string | null;
  actual_exit: string | null;
  is_overdue: boolean;
  trek_duration: string | null;
  notes: string;
  registered_at: string;
  updated_at: string;
}