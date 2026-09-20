export type SosAlertStatus = "active" | "resolved";

export interface SosAlert {
  id: number;
  profile_id: number;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  status: SosAlertStatus;
  created_at: string;
  resolved_at: string | null;
  trekker: {
    id: number;
    name: string;
    username: string;
    phone: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    last_known_latitude: number | null;
    last_known_longitude: number | null;
  };
}

export interface SendSosPayload {
  latitude: number | null;
  longitude: number | null;
  message?: string;
}