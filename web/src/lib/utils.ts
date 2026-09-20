import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function elapsedLabel(
  startedAt: string,
  endedAt: string | null,
): string {
  const end = endedAt ? new Date(endedAt) : new Date();
  const mins = Math.floor(
    (end.getTime() - new Date(startedAt).getTime()) / 60000,
  );
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function toLocalISO(
  dateStr: string,
  timeStr: string,
  tzOffset = "+08:00",
): string {
  return `${dateStr}T${timeStr}:00${tzOffset}`;
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
