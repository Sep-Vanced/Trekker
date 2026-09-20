import { Ionicons } from "@expo/vector-icons";

export type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export const PHASE_CONFIG: Record<
  string,
  { accent: string; accentAlpha: string; text: string; mapColor: string; nwBg: string; nwText: string; icon: IoniconName }
> = {
  "Phase 1":         { accent: "#1f8645", accentAlpha: "#1f864520", text: "#166534", mapColor: "#22c55e", nwBg: "bg-emerald-100", nwText: "text-emerald-800", icon: "leaf"       },
  "Phase 2":         { accent: "#0369a1", accentAlpha: "#0369a120", text: "#1e40af", mapColor: "#3b82f6", nwBg: "bg-sky-100",     nwText: "text-sky-800",     icon: "water"      },
  "Phase 3":         { accent: "#7c3aed", accentAlpha: "#7c3aed20", text: "#5b21b6", mapColor: "#8b5cf6", nwBg: "bg-violet-100", nwText: "text-violet-800",  icon: "planet"     },
  "Phase 4":         { accent: "#c2410c", accentAlpha: "#c2410c20", text: "#9a3412", mapColor: "#f97316", nwBg: "bg-orange-100", nwText: "text-orange-800",  icon: "flame"      },
  "Transition Zone": { accent: "#d97706", accentAlpha: "#d9770620", text: "#92400e", mapColor: "#f59e0b", nwBg: "bg-amber-100",  nwText: "text-amber-800",   icon: "git-branch" },
};