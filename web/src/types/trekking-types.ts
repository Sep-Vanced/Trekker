export interface TourismRegistrationPayload {
  route_id: number;
  planned_entry: string;
  planned_exit: string;
  group_size: number;
  age?: number;
  citizen?: string;
  place?: string;
  pax?: number;
  notes?: string;
}

export interface TourismRegistration {
  id: number;
  permit_number: string;
  qr_code: string;
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
    age: number | null;
    citizen: string | null;
    place: string | null;
    pax: number;
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

export interface MyRegistration {
  id: number;
  permit_number: string;
  full_name: string;
  route_name: string;
  status: string;
  group_size: number;
  age: number | null;
  citizen: string | null;
  place: string | null;
  pax: number;
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
  age: number | null;
  citizen: string | null;
  place: string | null;
  pax: number;
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
