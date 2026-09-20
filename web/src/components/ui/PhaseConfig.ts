export const PHASE_CONFIG: Record<
  string,
  {
    accent: string;
    accentAlpha: string;
    text: string;
    mapColor: string;
    nwBg: string;
    nwText: string;
    icon: string;
  }
> = {
  "Phase 1": {
    accent: "#366644", // canopy — forest trail
    accentAlpha: "#36664420",
    text: "#234331",
    mapColor: "#457a53",
    nwBg: "bg-canopy-100",
    nwText: "text-canopy-800",
    icon: "leaf",
  },
  "Phase 2": {
    accent: "#2e6b7a", // muted lake teal — keeps water association, warmed to fit
    accentAlpha: "#2e6b7a20",
    text: "#1f4b56",
    mapColor: "#4a93a3",
    nwBg: "bg-sky-100",
    nwText: "text-sky-800",
    icon: "water",
  },
  "Phase 3": {
    accent: "#6b4a6f", // muted plum — dusk ridge
    accentAlpha: "#6b4a6f20",
    text: "#4a3250",
    mapColor: "#8a6690",
    nwBg: "bg-violet-100",
    nwText: "text-violet-800",
    icon: "planet",
  },
  "Phase 4": {
    accent: "#b5511f", // rust — summit / exposed terrain
    accentAlpha: "#b5511f20",
    text: "#7a3714",
    mapColor: "#c96a34",
    nwBg: "bg-rust-100",
    nwText: "text-rust-600",
    icon: "flame",
  },
  "Transition Zone": {
    accent: "#b8790a", // ochre
    accentAlpha: "#b8790a20",
    text: "#7a5006",
    mapColor: "#d19832",
    nwBg: "bg-amber-100",
    nwText: "text-amber-800",
    icon: "git-branch",
  },
};

export const getPhaseConfig = (phase: string) =>
  PHASE_CONFIG[phase] ?? {
    accent: "#6f6350",
    accentAlpha: "#6f635020",
    text: "#4a4030",
    mapColor: "#a89b84",
    nwBg: "bg-bark-100",
    nwText: "text-bark-700",
    icon: "location",
  };