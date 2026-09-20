export type RegistrationStatus = "registered" | "completed" | "cancelled" | "overdue";

export interface RegistrationApiResult {
  id: number;
  permit_number: string;
  name: string;
  username: string;
  phone: string | null;
  vehicle: string | null;
  route_name: string;
  status: RegistrationStatus;
  group_size: number;
  planned_entry: string;
  planned_exit: string;
  actual_entry: string | null;
  actual_exit: string | null;
  is_overdue: boolean;
  registered_at: string;
}

export interface RegistrationsResponse {
  count: number;
  page: number;
  page_size: number;
  pages: number;
  results: RegistrationApiResult[];
}