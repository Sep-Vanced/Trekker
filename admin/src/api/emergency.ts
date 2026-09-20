import { apiFetch } from "./client";
import type { SosAlert } from "@/types/sos";

export async function getActiveSosAlerts(): Promise<SosAlert[]> {
  const data = await apiFetch<{ results: SosAlert[] }>("/emergency/sos");
  return data.results;
}

export async function resolveSosAlert(id: number): Promise<void> {
  await apiFetch(`/emergency/sos/${id}`, { method: "PATCH" });
}