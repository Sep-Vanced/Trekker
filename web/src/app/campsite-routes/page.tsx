"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { TrekRoute } from "@/types/navigation-types";
import { RouteWeather } from "@/types/weather-types";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Droplets,
  Layers,
  Map,
  Mountain,
  Navigation,
  Ruler,
  Thermometer,
  TrendingUp,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const DIFFICULTY_CONFIG: Record<
  string,
  { accent: string; bg: string; text: string }
> = {
  easy: {
    accent: "#1f8645",
    bg: "bg-canopy-100",
    text: "text-canopy-700",
  },
  moderate: {
    accent: "#0369a1",
    bg: "bg-sky-100",
    text: "text-sky-800",
  },
  hard: {
    accent: "#c2410c",
    bg: "bg-orange-100",
    text: "text-orange-800",
  },
  expert: {
    accent: "#b91c1c",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

const STATUS_CONFIG: Record<
  string,
  { dotColor: string; bg: string; text: string }
> = {
  open: {
    dotColor: "#22c55e",
    bg: "bg-canopy-100",
    text: "text-canopy-700",
  },
  caution: {
    dotColor: "#f59e0b",
    bg: "bg-amber-100",
    text: "text-amber-800",
  },
  closed: { dotColor: "#ef4444", bg: "bg-rust-100", text: "text-rust-600" },
};

const WEATHER_CONDITION_CONFIG: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  clear: { icon: "☀️", color: "#f59e0b", bg: "#fef9c3" },
  sunny: { icon: "☀️", color: "#f59e0b", bg: "#fef9c3" },
  cloudy: { icon: "☁️", color: "#64748b", bg: "#f1f5f9" },
  partly_cloudy: { icon: "⛅", color: "#94a3b8", bg: "#f1f5f9" },
  overcast: { icon: "☁️", color: "#475569", bg: "#e2e8f0" },
  rain: { icon: "🌧️", color: "#2563eb", bg: "#dbeafe" },
  drizzle: { icon: "🌦️", color: "#3b82f6", bg: "#dbeafe" },
  heavy_rain: { icon: "⛈️", color: "#1d4ed8", bg: "#dbeafe" },
  thunderstorm: { icon: "⛈️", color: "#7c3aed", bg: "#ede9fe" },
  fog: { icon: "🌫️", color: "#94a3b8", bg: "#f1f5f9" },
  windy: { icon: "💨", color: "#0891b2", bg: "#cffafe" },
};

export default function CampsiteRoutes() {
  return (
    <Suspense
      fallback={
        <TabLayout>
          <div className="min-h-screen bg-topo flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
              <p className="text-bark-500 text-xs">Loading routes…</p>
            </div>
          </div>
        </TabLayout>
      }
    >
      <CampsiteRoutesContent />
    </Suspense>
  );
}

function CampsiteRoutesContent() {
  const searchParams = useSearchParams();
  const campsiteId = searchParams.get("campsiteId");
  const campsiteName = searchParams.get("campsiteName")
    ? decodeURIComponent(searchParams.get("campsiteName")!)
    : "Campsite";
  const campsitePhase = searchParams.get("campsitePhase")
    ? decodeURIComponent(searchParams.get("campsitePhase")!)
    : "";

  const [routes, setRoutes] = useState<TrekRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<number, RouteWeather>>(
    {},
  );

  useEffect(() => {
    const load = async () => {
      if (!campsiteId) return;
      try {
        const res = await fetch(`/api/navigation/trekroute/${campsiteId}`);
        const data = await res.json();
        const active = data.filter((r: TrekRoute) => r.is_active);
        setRoutes(active);
        // Fetch weather for all routes
        active.forEach(async (r: TrekRoute) => {
          try {
            const wRes = await fetch(`/api/weather/routes/${r.id}`);
            const wData = await wRes.json();
            setWeatherMap((prev) => ({ ...prev, [r.id]: wData }));
          } catch {}
        });
      } catch {
        setError("Failed to load routes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campsiteId]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ──────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                href="/routes"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition-colors flex items-center justify-center shrink-0 mt-1"
              >
                <ArrowLeft size={18} className="text-canopy-200" />
              </Link>
              <div>
                <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                  Tourist Routes
                </p>
                <h1 className="text-white text-3xl lg:text-4xl font-display font-bold mt-1 leading-none">
                  {campsiteName}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <Map size={13} className="text-canopy-300" />
                  <span className="text-canopy-200 text-sm">
                    Available travel routes to this camp
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {campsitePhase && (
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3.5 py-2 border border-white/10">
                  <Layers size={13} className="text-canopy-200" />
                  <span className="text-white/90 text-xs font-bold">
                    {campsitePhase}
                  </span>
                </div>
              )}
              {!loading && (
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3.5 py-2 border border-white/10">
                  <Mountain size={13} className="text-canopy-200" />
                  <span className="text-white/90 text-xs font-bold">
                    {routes.length} routes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Route List ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
            <Mountain size={15} className="text-white" />
          </div>
          <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
            Available Routes
          </span>
          <span className="flex-1 border-b border-dashed border-bark-300 translate-y-[1px]" />
        </div>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] animate-pulse"
              >
                <div className="h-1 bg-canopy-600/20" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-parchment-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 bg-parchment-100 rounded-full" />
                      <div className="h-2.5 w-full bg-parchment-100 rounded-full" />
                    </div>
                  </div>
                  <div className="h-10 rounded-xl bg-parchment-100" />
                </div>
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

        {!loading && !error && routes.length === 0 && (
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] flex flex-col items-center py-14">
            <div className="w-14 h-14 rounded-2xl bg-parchment-100 flex items-center justify-center mb-3">
              <Mountain size={26} className="text-bark-300" />
            </div>
            <p className="text-[15px] font-bold text-bark-700 font-display">
              No routes available
            </p>
            <p className="text-xs text-bark-500 mt-1 text-center px-8">
              No travel routes found for {campsiteName}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {routes.map((route) => {
              const diff =
                DIFFICULTY_CONFIG[route.difficulty.toLowerCase()] ??
                DIFFICULTY_CONFIG.moderate;
              const status =
                STATUS_CONFIG[route.status.toLowerCase()] ?? STATUS_CONFIG.open;
              const weather = weatherMap[route.id];
              const hours = parseFloat(route.estimated_hours);
              const timeLabel =
                hours < 1 ? `${Math.round(hours * 60)} min` : `${hours}h`;

              return (
                <div
                  key={route.id}
                  className="bg-white rounded-xl overflow-hidden border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] hover:shadow-md transition-shadow"
                >
                  <div style={{ backgroundColor: diff.accent, height: 4 }} />
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-bark-900 font-display leading-snug">
                          {route.name}
                        </p>
                        <p className="text-xs text-bark-500 mt-1 leading-[17px] line-clamp-2">
                          {route.description}
                        </p>
                      </div>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${diff.accent}18` }}
                      >
                        <Mountain size={20} color={diff.accent} />
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 mb-3">
                      <span
                        className={`flex items-center px-2.5 py-1 rounded-full ${diff.bg}`}
                      >
                        <span className={`text-[11px] font-bold ${diff.text}`}>
                          {capitalize(route.difficulty)}
                        </span>
                      </span>
                      <span
                        className={`flex items-center px-2.5 py-1 rounded-full ${status.bg}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: status.dotColor }}
                        />
                        <span
                          className={`text-[11px] font-bold ${status.text} ml-1.5`}
                        >
                          {capitalize(route.status)}
                        </span>
                      </span>
                    </div>

                    {weather && (
                      <div
                        className="rounded-xl mb-3 overflow-hidden border"
                        style={{
                          backgroundColor: weather.report.is_safe_to_trek
                            ? "#f0fdf4"
                            : "#fff7ed",
                          borderColor: weather.report.is_safe_to_trek
                            ? "#bbf7d0"
                            : "#fed7aa",
                        }}
                      >
                        <div className="flex flex-row items-center px-3 py-2.5 gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: (
                                WEATHER_CONDITION_CONFIG[
                                  weather.report.condition
                                ] ?? WEATHER_CONDITION_CONFIG.cloudy
                              ).bg,
                            }}
                          >
                            <span className="text-xl">
                              {
                                (
                                  WEATHER_CONDITION_CONFIG[
                                    weather.report.condition
                                  ] ?? WEATHER_CONDITION_CONFIG.cloudy
                                ).icon
                              }
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[12px] font-bold text-bark-900">
                                {weather.report.condition_display}
                              </span>
                              <span
                                className="flex items-center px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: weather.report.is_safe_to_trek
                                    ? "#dcfce7"
                                    : "#ffedd5",
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: weather.report.is_safe_to_trek
                                      ? "#22c55e"
                                      : "#f97316",
                                  }}
                                />
                                <span
                                  className="text-[10px] font-bold ml-1"
                                  style={{
                                    color: weather.report.is_safe_to_trek
                                      ? "#15803d"
                                      : "#c2410c",
                                  }}
                                >
                                  {weather.report.is_safe_to_trek
                                    ? "Safe to Travel"
                                    : "Use Caution"}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Thermometer size={11} color="#a89b84" />
                                <span className="text-[11px] text-bark-500 font-medium">
                                  {weather.report.temperature_c}°C
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Droplets size={11} color="#a89b84" />
                                <span className="text-[11px] text-bark-500 font-medium">
                                  {weather.report.humidity_pct}%
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Wind size={11} color="#a89b84" />
                                <span className="text-[11px] text-bark-500 font-medium">
                                  {weather.report.wind_speed_kph} kph
                                </span>
                              </span>
                            </div>
                          </div>
                          {weather.has_danger || weather.alert_count > 0 ? (
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <AlertTriangle size={15} color="#f97316" />
                              </div>
                              <span className="text-[9px] font-bold text-orange-500 mt-0.5">
                                {weather.alert_count} alert
                                {weather.alert_count > 1 ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-canopy-100 flex items-center justify-center shrink-0">
                              <CheckCircle size={15} color="#22c55e" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center pb-2 border-b border-bark-100 flex-wrap gap-y-2">
                      <span className="flex items-center mr-3">
                        <Ruler size={12} color="#a89b84" />
                        <span className="text-[11px] text-bark-500 font-medium ml-1">
                          {route.total_distance_km} km
                        </span>
                      </span>
                      <span className="flex items-center mr-3">
                        <Clock size={12} color="#a89b84" />
                        <span className="text-[11px] text-bark-500 font-medium ml-1">
                          {timeLabel}
                        </span>
                      </span>
                      <span className="flex items-center mr-3">
                        <TrendingUp size={12} color="#a89b84" />
                        <span className="text-[11px] text-bark-500 font-medium ml-1">
                          +{route.elevation_gain_m}m
                        </span>
                      </span>
                      <span className="flex items-center ml-auto">
                        <Navigation size={11} color="#a89b84" />
                        <span className="text-[11px] text-bark-500 font-medium ml-1 truncate max-w-[90px]">
                          {route.start_name}
                        </span>
                      </span>
                    </div>

                    <Link
                      href={`/route-checkpoints?routeId=${route.id}&routeName=${encodeURIComponent(route.name)}&routeDifficulty=${encodeURIComponent(route.difficulty)}`}
                      className="w-full flex items-center justify-center rounded-xl py-3.5 mt-4 hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: diff.accent,
                        boxShadow: `0 4px 8px ${diff.accent}4D`,
                      }}
                    >
                      <Navigation size={15} color="white" />
                      <span className="text-white text-sm font-bold tracking-wide mx-2">
                        Check This Route
                      </span>
                      <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TabLayout>
  );
}