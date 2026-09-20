import { api } from "./client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ScanAction = "entry" | "exit";

export interface ScanPayload {
  qr_payload: string;
  action: ScanAction;
}

export interface RangerDashboard {
  [key: string]: any; // expand once you know the exact shape
}

export interface Registration {
  [key: string]: any;
}

export interface RegistrationsResponse {
  count: number;
  page: number;
  page_size: number;
  pages: number;
  results: Registration[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /tourism/ranger/dashboard/ */
export const getRangerDashboard = (): Promise<{ data: RangerDashboard }> =>
  api.get("/tourism/ranger/dashboard/");

/**
 * POST /tourism/ranger/scan/
 * Unified scan endpoint (entry or exit)
 */
export const scanQr = (payload: ScanPayload) =>
  api.post("/tourism/ranger/scan/", payload);

/**
 * POST /tourism/ranger/entry/<tracking_id>/
 * Log trekker entry
 */
export const logEntry = (trackingId: string, payload: ScanPayload) =>
  api.post(`/tourism/ranger/entry/${trackingId}/`, payload);

/**
 * POST /tourism/ranger/exit/<tracking_id>/
 * Log trekker exit
 */
export const logExit = (trackingId: string, payload: ScanPayload) =>
  api.post(`/tourism/ranger/exit/${trackingId}/`, payload);

/** GET /tourism/ranger/registrations/ */
export const getRangerRegistrations = (
  page = 1,
  pageSize = 20
): Promise<{ data: RegistrationsResponse }> =>
  api.get("/tourism/ranger/registrations/", {
    params: { page, page_size: pageSize },
  });