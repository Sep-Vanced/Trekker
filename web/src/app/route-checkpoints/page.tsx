"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Coffee,
  Cross,
  Flag,
  FlagTriangleRight,
  Locate,
  Mountain,
  Navigation,
  Tent,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const CP_TYPE_CONFIG: Record<
  string,
  {
    accent: string;
    icon: LucideIcon;
    label: string;
    gradient: [string, string];
  }
> = {
  waypoint: {
    accent: "#3b82f6",
    icon: Flag,
    label: "Waypoint",
    gradient: ["#1d4ed8", "#3b82f6"],
  },
  danger: {
    accent: "#ef4444",
    icon: FlagTriangleRight,
    label: "Danger",
    gradient: ["#a3291f", "#dc2626"],
  },
  rest: {
    accent: "#06b6d4",
    icon: Coffee,
    label: "Rest Stop",
    gradient: ["#0e7490", "#06b6d4"],
  },
  camp: {
    accent: "#22c55e",
    icon: Tent,
    label: "Camp",
    gradient: ["#15803d", "#22c55e"],
  },
  emergency: {
    accent: "#f97316",
    icon: Cross,
    label: "Emergency",
    gradient: ["#c2410c", "#f97316"],
  },
};

const DIFFICULTY_CONFIG: Record<
  string,
  { accent: string; label: string; gradient: [string, string] }
> = {
  easy: { accent: "#366644", label: "Easy", gradient: ["#2b5138", "#457a53"] },
  moderate: {
    accent: "#0369a1",
    label: "Moderate",
    gradient: ["#1d4ed8", "#3b82f6"],
  },
  hard: { accent: "#c2410c", label: "Hard", gradient: ["#c2410c", "#f97316"] },
  expert: {
    accent: "#a3291f",
    label: "Expert",
    gradient: ["#b91c1c", "#ef4444"],
  },
};

export default function RouteCheckpoints() {
  return (
    <Suspense
      fallback={
        <TabLayout>
          <div className="min-h-screen bg-topo flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
              <p className="text-bark-500 text-xs">Loading checkpoints…</p>
            </div>
          </div>
        </TabLayout>
      }
    >
      <RouteCheckpointsContent />
    </Suspense>
  );
}

interface Checkpoint {
  id: number;
  name: string;
  order: number;
  latitude: string;
  longitude: string;
  cp_type: string;
  description: string | null;
  alert_message: string | null;
  radius_meters: number;
  is_mandatory: boolean;
  route: number;
}

function RouteCheckpointsContent() {
  const { refreshUserIn } = useAuth();
  const searchParams = useSearchParams();
  const routeId = searchParams.get("routeId");
  const routeName = searchParams.get("routeName")
    ? decodeURIComponent(searchParams.get("routeName")!)
    : "Route";
  const routeDifficulty = searchParams.get("routeDifficulty")
    ? decodeURIComponent(searchParams.get("routeDifficulty")!)
    : "moderate";

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const diffConfig =
    DIFFICULTY_CONFIG[routeDifficulty.toLowerCase()] ??
    DIFFICULTY_CONFIG.moderate;

  useEffect(() => {
    const load = async () => {
      if (!routeId) return;
      try {
        const res = await fetch(`/api/navigation/checkpoint/${routeId}`);
        const data = await res.json();
        const sorted = data.sort(
          (a: Checkpoint, b: Checkpoint) => a.order - b.order,
        );
        setCheckpoints(sorted);
        if (sorted.length > 0) setActiveId(sorted[0].id);
      } catch {
        setError("Failed to load checkpoints. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routeId]);

  const activeIndex = checkpoints.findIndex((c) => c.id === activeId);
  const activeCheckpoint = activeIndex !== -1 ? checkpoints[activeIndex] : null;
  const mandatoryCount = checkpoints.filter((c) => c.is_mandatory).length;
  const dangerCount = checkpoints.filter(
    (c) => c.cp_type === "danger" || c.cp_type === "emergency",
  ).length;

  const goToPrev = () => {
    if (activeIndex > 0) setActiveId(checkpoints[activeIndex - 1].id);
  };
  const goToNext = () => {
    if (activeIndex < checkpoints.length - 1)
      setActiveId(checkpoints[activeIndex + 1].id);
  };

  const handleBegin = async () => {
    // Refresh the access token before navigating to the protected
    // registration page so the user never hits "Authentication required".
    await refreshUserIn();
  };

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ──────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                href="/campsite-routes"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition-colors flex items-center justify-center shrink-0 mt-1"
              >
                <ArrowLeft size={18} className="text-canopy-200" />
              </Link>
              <div>
                <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                  Checkpoints
                </p>
                <h1 className="text-white text-3xl lg:text-4xl font-display font-bold mt-1 leading-tight">
                  {routeName}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <Mountain size={13} className="text-canopy-300" />
                  <span className="text-canopy-200 text-sm">
                    {checkpoints.length > 0
                      ? `${checkpoints.length} stops along this route`
                      : "Route timeline"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 border"
                style={{
                  backgroundColor: `${diffConfig.accent}20`,
                  borderColor: `${diffConfig.accent}35`,
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: diffConfig.accent }}
                >
                  {diffConfig.label}
                </span>
              </div>
              {mandatoryCount > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 rounded-lg px-3.5 py-2">
                  <AlertTriangle size={12} color="#fbbf24" />
                  <span className="text-xs font-bold text-amber-400">
                    {mandatoryCount} required
                  </span>
                </div>
              )}
              {dangerCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/25 rounded-lg px-3.5 py-2">
                  <FlagTriangleRight size={12} color="#f87171" />
                  <span className="text-xs font-bold text-red-400">
                    {dangerCount} hazards
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-3.5 py-2">
                <Locate size={12} className="text-canopy-200" />
                <span className="text-white/90 text-xs font-bold">
                  {checkpoints.length} stops
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Checkpoint Strip ───────────────────────────────── */}
        {!loading && !error && activeCheckpoint && (
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] mb-4 overflow-hidden">
            <div className="h-[3px]" style={{ backgroundColor: CP_TYPE_CONFIG[activeCheckpoint.cp_type]?.accent ?? "#3b82f6" }} />
            <div className="flex items-center gap-2.5 p-3">
              <button
                onClick={goToPrev}
                disabled={activeIndex === 0}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-parchment-100 border border-bark-100 disabled:opacity-30 hover:bg-parchment-200"
              >
                <ArrowLeft size={16} className={activeIndex > 0 ? "text-bark-900" : "text-bark-300"} />
              </button>
              <div className="flex-1 flex items-center gap-3 bg-parchment-100 rounded-xl px-3 py-2 border border-bark-100">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      CP_TYPE_CONFIG[activeCheckpoint.cp_type]?.accent ?? "#3b82f6",
                  }}
                >
                  <span className="text-white text-[11px] font-black">
                    {activeCheckpoint.order}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-bark-900 truncate">
                    {activeCheckpoint.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: CP_TYPE_CONFIG[activeCheckpoint.cp_type]?.accent ?? "#3b82f6",
                      }}
                    >
                      {CP_TYPE_CONFIG[activeCheckpoint.cp_type]?.label ?? "Waypoint"}
                    </span>
                    <span className="text-[10px] text-bark-500 ml-auto">
                      {activeCheckpoint.order} / {checkpoints.length}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={goToNext}
                disabled={activeIndex === checkpoints.length - 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-parchment-100 border border-bark-100 disabled:opacity-30 hover:bg-parchment-200"
              >
                <ArrowRight size={16} className={activeIndex < checkpoints.length - 1 ? "text-bark-900" : "text-bark-300"} />
              </button>
            </div>
          </div>
        )}

        {/* ── Checkpoint Timeline ───────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
            <Locate size={15} className="text-white" />
          </div>
          <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
            Route Timeline
          </span>
          <span className="flex-1 border-b border-dashed border-bark-300 translate-y-[1px]" />
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-parchment-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-parchment-100 rounded-md" />
                    <div className="h-2 w-1/2 bg-parchment-100 rounded" />
                  </div>
                </div>
                <div className="h-2 bg-parchment-100 rounded mb-1" />
                <div className="h-2 w-3/4 bg-parchment-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="bg-rust-100/60 border border-rust-100 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle size={16} className="text-rust-500 shrink-0" />
            <span className="flex-1 text-sm text-rust-600">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-rust-600 font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && checkpoints.length === 0 && (
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] flex flex-col items-center py-12">
            <Mountain size={30} className="text-bark-300" />
            <p className="text-[15px] font-bold text-bark-700 font-display mt-3">
              No checkpoints yet
            </p>
            <p className="text-xs text-bark-500 mt-1 text-center">
              This route has not been set up with checkpoints.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          checkpoints.map((cp, idx) => {
            const cpCfg = CP_TYPE_CONFIG[cp.cp_type] ?? CP_TYPE_CONFIG.waypoint;
            const isActive = cp.id === activeId;
            return (
              <div key={cp.id} className="flex flex-row gap-3">
                <div className="flex flex-col items-center w-9">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isActive
                        ? cpCfg.accent
                        : cpCfg.accent + "1a",
                      borderWidth: isActive ? 0 : 1.5,
                      borderColor: cpCfg.accent + "40",
                      boxShadow: isActive ? `0 0 12px ${cpCfg.accent}` : "none",
                    }}
                  >
                    <span
                      className="text-xs font-extrabold font-display"
                      style={{ color: isActive ? "white" : cpCfg.accent }}
                    >
                      {cp.order}
                    </span>
                  </div>
                  {idx < checkpoints.length - 1 && (
                    <div
                      className="w-[1.5px] flex-1 mt-1 rounded-sm"
                      style={{
                        backgroundColor: isActive
                          ? cpCfg.accent + "45"
                          : cpCfg.accent + "20",
                      }}
                    />
                  )}
                </div>

                <button
                  onClick={() => setActiveId(cp.id)}
                  className="flex-1 mb-3 rounded-xl overflow-hidden border bg-white text-left transition-all"
                  style={{
                    borderColor: isActive
                      ? cpCfg.accent + "55"
                      : "var(--color-bark-100)",
                    boxShadow: isActive
                      ? `0 6px 16px ${cpCfg.accent}33`
                      : "0 2px 8px rgba(36,29,20,0.06)",
                  }}
                >
                  <div
                    className="h-[3px] w-full"
                    style={{
                      backgroundColor: isActive ? cpCfg.accent : "transparent",
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-start mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0"
                        style={{ backgroundColor: cpCfg.accent + "18" }}
                      >
                        <cpCfg.icon size={15} color={cpCfg.accent} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-bold text-bark-900 font-display leading-[18px] mb-1">
                          {cp.name}
                        </p>
                        <div className="flex flex-row gap-1.5 flex-wrap">
                          <span
                            className="flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold"
                            style={{
                              backgroundColor: cpCfg.accent + "18",
                              borderColor: cpCfg.accent + "28",
                              color: cpCfg.accent,
                            }}
                          >
                            {cpCfg.label}
                          </span>
                          {cp.is_mandatory && (
                            <span className="flex items-center px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                              <span className="w-1 h-1 rounded-full bg-amber-500" />
                              <span className="text-[10px] font-bold text-amber-700 ml-1">
                                Required
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Locate
                        size={13}
                        color={isActive ? cpCfg.accent : "rgba(36,29,20,0.3)"}
                        className="ml-1"
                      />
                    </div>

                    <p className="text-xs text-bark-500 leading-[18px] line-clamp-2">
                      {cp.description}
                    </p>

                    {isActive && cp.alert_message && (
                      <div
                        className="flex items-start gap-2 rounded-xl p-2.5 mt-2.5 border"
                        style={{
                          borderColor: cpCfg.accent + "30",
                          backgroundColor: cpCfg.accent + "10",
                        }}
                      >
                        <AlertTriangle
                          size={10}
                          color={cpCfg.accent}
                          className="mt-0.5 shrink-0"
                        />
                        <span
                          className="flex-1 text-[11px] font-medium"
                          style={{ color: cpCfg.accent }}
                        >
                          {cp.alert_message}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-bark-100">
                      <span className="text-[10px] text-bark-500 font-medium flex-1">
                        {parseFloat(cp.latitude).toFixed(5)}°,{" "}
                        {parseFloat(cp.longitude).toFixed(5)}°
                      </span>
                      <span className="text-[10px] text-bark-500 font-medium">
                        {cp.radius_meters}m radius
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}

        {!loading && !error && checkpoints.length > 0 && (
          <Link
            href={`/trek-start?routeId=${routeId}`}
            onClick={handleBegin}
            className="w-full rounded-xl overflow-hidden block mt-4 hover:opacity-95 transition-opacity"
            style={{ boxShadow: `0 6px 16px ${diffConfig.accent}66` }}
          >
            <div
              className="flex flex-row items-center justify-center gap-2 py-4"
              style={{
                background: `linear-gradient(90deg, ${diffConfig.gradient[0]}, ${diffConfig.gradient[1]})`,
              }}
            >
              <Navigation size={16} color="white" />
              <span className="text-white text-sm font-extrabold tracking-wide">
                Begin This Route
              </span>
              <ArrowRight size={13} color="rgba(255,255,255,0.7)" />
            </div>
          </Link>
        )}
      </div>
    </TabLayout>
  );
}