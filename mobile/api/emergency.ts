import { api } from "./client";
import { SosAlert, SendSosPayload } from "@/types/sos-types";

/** POST /emergency/sos — trekker sends an SOS alert */
export const sendSos = (payload: SendSosPayload) =>
  api.post<{ id: number; status: string; success: boolean }>(
    "/emergency/sos",
    payload,
  );

/** GET /emergency/sos — ranger fetches active SOS alerts */
export const getActiveSosAlerts = () =>
  api.get<{ results: SosAlert[] }>("/emergency/sos");

/** PATCH /emergency/sos/:id — ranger resolves an alert */
export const resolveSosAlert = (id: number) =>
  api.patch<{ success: boolean }>(`/emergency/sos/${id}`);