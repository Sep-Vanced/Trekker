"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Mountain,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Swal from "sweetalert2";

interface SessionDetail {
  id: number;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  profile: number;
  route: number;
}

// Route detail shape is guessed defensively — the trekroute/detail endpoint's
// actual response wasn't available when this was built, so every field is
// optional and the UI falls back to just showing the raw route ID.
interface RouteInfo {
  name?: string;
  difficulty?: string;
  total_distance_km?: number;
  status?: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function formatDuration(startIso: string, endIso: string) {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function SessionDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!session?.is_active) return;
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, [session?.is_active]);

  useEffect(() => {
    if (!id) {
      setError("No session ID provided.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/user/trekking-session/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.detail || "Session not found.");
          setLoading(false);
          return;
        }
        const data: SessionDetail = await res.json();
        setSession(data);

        // Best-effort enrichment — don't block the page on this.
        try {
          const routeRes = await fetch(
            `/api/navigation/trekroute/detail/${data.route}`,
            { credentials: "include" },
          );
          if (routeRes.ok) {
            const routeData = await routeRes.json();
            setRouteInfo(routeData?.route ?? routeData ?? null);
          }
        } catch {
          // silent — route enrichment is optional
        }
      } catch {
        setError("Failed to load session. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEndSession = async () => {
    if (!session) return;
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
    setEnding(true);
    try {
      const res = await fetch(`/api/user/trekking-session/${session.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ended_at: new Date().toISOString() }),
      });
      if (!res.ok) {
        Swal.fire({
          title: "Error",
          text: "Failed to end session. Please try again.",
          icon: "error",
          confirmButtonColor: "#b5511f",
          background: "#fbfaf3",
        });
        return;
      }
      const updated: SessionDetail = await res.json();
      setSession(updated);
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
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <AlertTriangle size={32} className="text-rust-500 mb-3" />
        <p className="text-bark-900 font-semibold mb-1">
          {error || "Session not found."}
        </p>
        <Link href="/trek" className="text-canopy-700 text-sm font-bold mt-3">
          Back to My Sessions
        </Link>
      </div>
    );
  }

  const routeLabel = routeInfo?.name ?? `Route ${session.route}`;

  return (
    <div className="min-h-screen bg-topo">
      <div
        className={`px-5 pt-5 pb-6 ${
          session.is_active ? "bg-expedition" : "bg-bark-700"
        }`}
      >
        <button
          onClick={() => router.push("/trek")}
          className="flex items-center bg-white/20 px-3 py-1.5 rounded-full mb-4"
        >
          <ArrowLeft size={16} className="text-white" />
          <span className="text-white text-xs font-semibold ml-1.5">
            Back
          </span>
        </button>
        <p className="text-white/60 text-[10px] font-bold uppercase tracking-[1.5px] mb-1">
          Session #{session.id}
        </p>
        <h1 className="text-white text-2xl font-extrabold font-display">{routeLabel}</h1>
        {routeInfo?.difficulty && (
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/15">
            <span className="text-white text-[11px] font-bold capitalize">
              {routeInfo.difficulty}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
          <div className="h-[3px] bg-canopy-600" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity
                  size={16}
                  className={session.is_active ? "text-canopy-600" : "text-bark-500"}
                />
                <span className="text-sm font-extrabold text-bark-900 font-display">
                  Status
                </span>
              </div>
              <span
                className={`flex items-center px-3 py-1 rounded-full ${
                  session.is_active ? "bg-canopy-100" : "bg-parchment-100"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    session.is_active ? "bg-canopy-500" : "bg-bark-300"
                  }`}
                />
                <span
                  className={`text-[11px] font-bold ml-1.5 ${
                    session.is_active ? "text-canopy-700" : "text-bark-500"
                  }`}
                >
                  {session.is_active ? "Active" : "Ended"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-parchment-100 rounded-xl p-3 border border-bark-100">
                <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px] flex items-center gap-1">
                  <Calendar size={11} /> Started
                </p>
                <p className="text-sm text-bark-900 font-bold mt-1">
                  {formatTime(session.started_at)}
                </p>
                <p className="text-[11px] text-bark-500">
                  {formatDate(session.started_at)}
                </p>
              </div>

              {session.is_active ? (
                <div className="bg-canopy-50 rounded-xl p-3 border border-canopy-200">
                  <p className="text-[10px] text-canopy-600 font-bold uppercase tracking-[0.5px] flex items-center gap-1">
                    <Clock size={11} /> Elapsed
                  </p>
                  <p className="text-sm text-canopy-800 font-bold mt-1">
                    {Math.floor(
                      (now.getTime() - new Date(session.started_at).getTime()) /
                        60000,
                    )}{" "}
                    min
                  </p>
                  <p className="text-[11px] text-canopy-500">since start</p>
                </div>
              ) : session.ended_at ? (
                <div className="bg-parchment-100 rounded-xl p-3 border border-bark-100">
                  <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px] flex items-center gap-1">
                    <Clock size={11} /> Ended
                  </p>
                  <p className="text-sm text-bark-900 font-bold mt-1">
                    {formatTime(session.ended_at)}
                  </p>
                  <p className="text-[11px] text-bark-500">
                    {formatDate(session.ended_at)}
                  </p>
                </div>
              ) : null}
            </div>

            {!session.is_active && session.ended_at && (
              <div className="mt-3 bg-parchment-100 rounded-xl p-3 border border-bark-100">
                <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                  Total Duration
                </p>
                <p className="text-sm text-bark-900 font-bold mt-1">
                  {formatDuration(session.started_at, session.ended_at)}
                </p>
              </div>
            )}
          </div>
        </div>

        {routeInfo && (
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Mountain size={16} className="text-canopy-600" />
                <span className="text-sm font-extrabold text-bark-900 font-display">
                  Route Info
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {routeInfo.total_distance_km !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-bark-500">Distance</span>
                    <span className="text-bark-900 font-semibold">
                      {routeInfo.total_distance_km} km
                    </span>
                  </div>
                )}
                {routeInfo.status && (
                  <div className="flex justify-between">
                    <span className="text-bark-500">Route Status</span>
                    <span className="text-bark-900 font-semibold capitalize">
                      {routeInfo.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {session.is_active && (
          <button
            onClick={handleEndSession}
            disabled={ending}
            className="w-full bg-rust-100/50 border border-rust-100 rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-rust-100 transition-colors disabled:opacity-60"
          >
            {ending ? (
              <div className="w-4 h-4 border-2 border-rust-300 border-t-rust-600 rounded-full animate-spin" />
            ) : (
              <>
                <AlertTriangle size={16} className="text-rust-500" />
                <span className="text-rust-600 text-sm font-bold">
                  End Session
                </span>
              </>
            )}
          </button>
        )}

        <Link
          href="/emergency"
          className="block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="bg-rust-500 flex items-center justify-center py-4 gap-2 hover:bg-rust-600 transition-colors">
            <Navigation size={18} className="text-white" />
            <span className="text-white text-base font-extrabold">
              Emergency SOS
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function SessionDetail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
        </div>
      }
    >
      <TabLayout>
        <SessionDetailContent />
      </TabLayout>
    </Suspense>
  );
}