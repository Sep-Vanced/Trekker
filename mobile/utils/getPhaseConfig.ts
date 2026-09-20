import { IoniconName, PHASE_CONFIG } from "./phase-config";

export const getPhaseConfig = (phase: string) =>
  PHASE_CONFIG[phase] ?? {
    accent: "#64748b", accentAlpha: "#64748b20", text: "#475569",
    mapColor: "#94a3b8", nwBg: "bg-slate-100", nwText: "text-slate-600", icon: "location" as IoniconName,
  };