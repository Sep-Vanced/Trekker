import { apiFetch } from "./client";
import type { RegistrationsResponse, RegistrationApiResult } from "@/types/registration";
import type { Tourist, TouristStatus } from "@/types/tourist";

function mapStatus(r: RegistrationApiResult): TouristStatus | null {
  switch (r.status) {
    case "registered":
    case "overdue":
      return "Active";
    case "completed":
      return "Completed";
    case "cancelled":
      return null;
  }
}

export function mapToTourist(r: RegistrationApiResult): Tourist | null {
  const status = mapStatus(r);
  if (!status) return null;

  return {
    id: r.id,
    name: r.name,
    contact: r.phone ?? "N/A",
    vehicle: (r.vehicle as Tourist["vehicle"]) ?? "Unknown",
    status,
    destination: r.route_name,
    startTime: r.actual_entry ?? r.planned_entry,
    location: undefined,
    lastPing: undefined,
  };
}

export async function fetchTourists(): Promise<Tourist[]> {
  const data = await apiFetch<RegistrationsResponse>("/tourism/ranger/registrations");
  return data.results.map(mapToTourist).filter((t): t is Tourist => t !== null);
}