export interface TourismRegistrationPayload {
  route_id: number;
  planned_entry: string;   // ISO 8601 with timezone
  planned_exit: string;    // ISO 8601 with timezone
  group_size: number;
  notes?: string;
}
 
export interface TourismRegistration {
  id: number;
  permit_number: string;       // was registration_number
  qr_code: string;             // base64 PNG string
  message: string;
  success: boolean;
  registration: {
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
    notes: string | null;
    registered_at: string;
    updated_at: string;
  };
}
 
export interface TrekkingSessionPayload {
  route_id: number;
}
 
export interface TrekkingSession {
  id: number;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  profile: number;
  route: number;
}
 
export interface CreateSessionResponse {
  message: string;
  session_id: number;
}