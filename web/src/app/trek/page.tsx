"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { Checkpoint } from "@/types/navigation-types";
import { TrekkingSession } from "@/types/trekking-types";
import {
  Activity,
  AlertTriangle,
  Compass,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

type HazardAlert = {
  checkpointName: string;
  message: string;
  cpType: string;
} | null;

// Distance between two lat/lng points, in meters.
function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Trek() {
  const [sessions, setSessions] = useState<TrekkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hazardAlerts, setHazardAlerts] = useState<
    Record<number, HazardAlert>
  >({});
  const checkpointsCacheRef = useRef<Record<number, Checkpoint[]>>({});

  const fetchSessions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch("/api/user/trekking-session");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/trekking-session");
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load sessions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeSessions = sessions.filter((s) => s.is_active);
  const inactiveSessions = sessions.filter((s) => !s.is_active);
  const activeSessionIds = activeSessions.map((s) => s.id).join(",");

  const handleEndSession = async (sessionId: number) => {
    const result = await Swal.fire({
      title: "End this session?",
      text: "This will mark the travel session as completed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, end session",
      confirmButtonColor: "#b5511f",
      cancelButtonColor: "#6f6350",
      background: "#fbfaf3",
      showCloseButton: true,
    });
    if (!result.isConfirmed) return;
    try {
      await fetch(`/api/user/trekking-session/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ended_at: new Date().toISOString() }),
      });
      await fetchSessions(true);
      Swal.fire({
        title: "Session ended",
        text: "Your travel session has been completed.",
        icon: "success",
        confirmButtonColor: "#366644",
        background: "#fbfaf3",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to end session. Please try again.",
        icon: "error",
        confirmButtonColor: "#b5511f",
        background: "#fbfaf3",
      });
    }
  };

  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeSessions.length > 0) {
      timerRef.current = setInterval(() => setNow(new Date()), 30000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSessions.length]);

  // ── Live location tracking + hazard detection ──────────────────────────
  // While any session is active: every 30s, grab a GPS fix, log it against
  // every active session (LocationLog), update the user's last-known
  // location, and check proximity to that route's danger/emergency
  // checkpoints so we can surface an in-app hazard warning.
  useEffect(() => {
    if (activeSessionIds === "") return;
    let cancelled = false;

    const currentActive = activeSessionIds
      .split(",")
      .filter(Boolean)
      .map((id) => sessions.find((s) => s.id === Number(id)))
      .filter((s): s is TrekkingSession => Boolean(s));

    const trackOnce = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (cancelled) return;
          const { latitude, longitude } = pos.coords;

          fetch("/api/user/location", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              last_known_latitude: latitude,
              last_known_longitude: longitude,
            }),
          }).catch(() => {});

          for (const s of currentActive) {
            fetch("/api/user/location-log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session: s.id,
                latitude,
                longitude,
              }),
            }).catch(() => {});

            let checkpoints = checkpointsCacheRef.current[s.route];
            if (!checkpoints) {
              try {
                const res = await fetch(
                  `/api/navigation/checkpoint/${s.route}`,
                );
                const data = await res.json();
                checkpoints = Array.isArray(data) ? data : [];
                checkpointsCacheRef.current[s.route] = checkpoints;
              } catch {
                checkpoints = [];
              }
            }

            const hazardCp = checkpoints.find(
              (cp) =>
                (cp.cp_type === "danger" || cp.cp_type === "emergency") &&
                distanceMeters(
                  latitude,
                  longitude,
                  parseFloat(cp.latitude),
                  parseFloat(cp.longitude),
                ) <= cp.radius_meters,
            );

            if (cancelled) return;
            setHazardAlerts((prev) => ({
              ...prev,
              [s.id]: hazardCp
                ? {
                    checkpointName: hazardCp.name,
                    message:
                      hazardCp.alert_message ??
                      "You are near a hazard zone.",
                    cpType: hazardCp.cp_type,
                  }
                : null,
            }));
          }
        },
        () => {
          // Permission denied or unavailable — skip silently, same as
          // the rest of the app's geolocation error handling.
        },
      );
    };

    trackOnce();
    const interval = setInterval(trackOnce, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionIds]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                Active Travel
              </p>
              <h1 className="text-white text-3xl lg:text-5xl font-display font-bold mt-1 leading-none">
                My Sessions
              </h1>
            </div>
            <button
              onClick={() => fetchSessions(true)}
              className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <RefreshCw size={16} className="text-white" />
              <span className="text-white text-sm font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active sessions */}
          <div className="space-y-4">
            {loading && (
              <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] p-8 flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
                <p className="text-bark-500 text-sm mt-3">Loading sessions…</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-rust-100/50 border border-rust-100 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={18} className="text-rust-500" />
                <span className="flex-1 text-sm text-rust-600">{error}</span>
                <button onClick={() => fetchSessions()} className="text-xs text-rust-600 font-bold">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && sessions.length === 0 && (
              <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] p-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-canopy-50 border border-canopy-200 flex items-center justify-center mb-4">
                  <Compass size={40} className="text-canopy-600" />
                </div>
                <h2 className="text-bark-900 text-xl font-bold font-display text-center mb-2">
                  No Active Trek
                </h2>
                <p className="text-bark-500 text-sm text-center mb-8 leading-6">
                  Choose a route and complete registration to begin your trekking session.
                </p>
                <Link
                  href="/routes"
                  className="bg-canopy-700 rounded-xl px-8 py-4 flex items-center gap-2 shadow-lg hover:bg-canopy-800 transition-colors"
                >
                  <Activity size={16} className="text-white" />
                  <span className="text-white font-bold text-base">Choose a Route</span>
                </Link>
              </div>
            )}

            {!loading && activeSessions.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                    <Activity size={15} className="text-white" />
                  </div>
                  <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
                    Active Sessions
                  </span>
                  <span className="ml-auto bg-canopy-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-canopy-800">
                    {activeSessions.length}
                  </span>
                </div>
                {activeSessions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden"
                  >
                    <div className="h-[3px] bg-canopy-600 w-full" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-canopy-50 flex items-center justify-center">
                            <Activity size={18} className="text-canopy-600" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-bark-900 font-display">
                              Session #{s.id}
                            </p>
                            <p className="text-xs text-bark-500">Route {s.route}</p>
                          </div>
                        </div>
                        <span className="flex items-center px-3 py-1 rounded-full bg-canopy-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-canopy-500" />
                          <span className="text-[11px] font-bold text-canopy-700 ml-1.5">Active</span>
                        </span>
                      </div>

                      {hazardAlerts[s.id] && (
                        <div className="mb-4 rounded-xl border border-rust-100 bg-rust-100/50 p-3 flex items-start gap-2">
                          <AlertTriangle
                            size={16}
                            className="text-rust-500 mt-0.5 shrink-0"
                          />
                          <div>
                            <p className="text-rust-600 text-xs font-bold">
                              Near {hazardAlerts[s.id]?.checkpointName}
                            </p>
                            <p className="text-rust-600 text-xs mt-0.5 leading-4">
                              {hazardAlerts[s.id]?.message}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-parchment-100 rounded-xl p-3 border border-bark-100">
                          <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">Started</p>
                          <p className="text-sm text-bark-900 font-bold mt-0.5">{formatTime(s.started_at)}</p>
                          <p className="text-[11px] text-bark-500">{formatDate(s.started_at)}</p>
                        </div>
                        <div className="bg-canopy-50 rounded-xl p-3 border border-canopy-200">
                          <p className="text-[10px] text-canopy-600 font-bold uppercase tracking-[0.5px]">Elapsed</p>
                          <p className="text-sm text-canopy-800 font-bold mt-0.5">
                            {Math.floor((now.getTime() - new Date(s.started_at).getTime()) / 60000)} min
                          </p>
                          <p className="text-[11px] text-canopy-500">since start</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/session-detail?id=${s.id}`}
                          className="flex-1 flex items-center justify-center bg-canopy-700 rounded-xl py-2.5 hover:bg-canopy-800 transition-colors"
                        >
                          <span className="text-white text-sm font-bold">View Details</span>
                        </Link>
                        <button
                          onClick={() => handleEndSession(s.id)}
                          className="flex items-center justify-center bg-rust-100/50 border border-rust-100 rounded-xl py-2.5 px-5 hover:bg-rust-100 transition-colors"
                        >
                          <span className="text-rust-600 text-sm font-bold">End</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Past sessions */}
          <div className="space-y-4">
            {!loading && inactiveSessions.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-bark-700 flex items-center justify-center shrink-0">
                    <Activity size={15} className="text-white" />
                  </div>
                  <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
                    Past Sessions
                  </span>
                  <span className="ml-auto bg-bark-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-bark-700">
                    {inactiveSessions.length}
                  </span>
                </div>
                {inactiveSessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/session-detail?id=${s.id}`}
                    className="block bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-[3px] bg-bark-300" />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-parchment-100 flex items-center justify-center">
                            <Activity size={18} className="text-bark-500" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-bark-900 font-display">Session #{s.id}</p>
                            <p className="text-xs text-bark-500">Route {s.route}</p>
                          </div>
                        </div>
                        <span className="flex items-center px-3 py-1 rounded-full bg-parchment-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-bark-300" />
                          <span className="text-[11px] font-bold text-bark-500 ml-1.5">Ended</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-parchment-100 rounded-xl p-3 border border-bark-100">
                          <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">Started</p>
                          <p className="text-sm text-bark-900 font-bold mt-0.5">{formatTime(s.started_at)}</p>
                          <p className="text-[11px] text-bark-500">{formatDate(s.started_at)}</p>
                        </div>
                        {s.ended_at && (
                          <div className="bg-parchment-100 rounded-xl p-3 border border-bark-100">
                            <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">Ended</p>
                            <p className="text-sm text-bark-900 font-bold mt-0.5">{formatTime(s.ended_at)}</p>
                            <p className="text-[11px] text-bark-500">{formatDate(s.ended_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}

            {!loading && sessions.length > 0 && (
              <Link
                href="/routes"
                className="flex items-center justify-center bg-canopy-700/10 border border-canopy-700/20 rounded-xl py-3.5 hover:bg-canopy-700/20 transition-colors"
              >
                <Plus size={17} className="text-canopy-600" />
                <span className="text-canopy-700 text-sm font-bold mx-1.5">Start Another Route</span>
              </Link>
            )}

            <Link
              href="/emergency"
              className="block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-rust-500 flex items-center justify-center py-4 hover:bg-rust-600 transition-colors">
                <AlertTriangle size={18} className="text-white" />
                <span className="text-white text-base font-extrabold mx-1.5">Emergency SOS</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </TabLayout>
  );
}