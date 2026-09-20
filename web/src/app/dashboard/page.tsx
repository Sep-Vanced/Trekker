"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { MyRegistration } from "@/types/trekking-types";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Footprints,
  Map,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RouteListItem {
  id: number;
  name: string;
  difficulty: string;
  status: "open" | "caution" | "closed";
  total_distance_km: string;
  campsite_name: string;
}

interface TrekkingSessionItem {
  id: number;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  route: number;
}

const ROUTE_STATUS: Record<
  string,
  { bg: string; text: string; dotColor: string; label: string }
> = {
  open: { bg: "bg-canopy-100", text: "text-canopy-700", dotColor: "#366644", label: "Open" },
  caution: { bg: "bg-rust-100", text: "text-rust-600", dotColor: "#b8790a", label: "Caution" },
  closed: { bg: "bg-rust-100", text: "text-rust-600", dotColor: "#a3291f", label: "Closed" },
};

function SectionHeading({
  icon: Icon,
  label,
  action,
}: {
  icon: LucideIcon;
  label: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-white" />
      </div>
      <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
        {label}
      </span>
      {action && (
        <button
          onClick={action.onPress}
          className="flex items-center gap-1 hover:text-canopy-800 transition-colors"
        >
          <span className="text-canopy-700 text-[11px] font-bold">
            {action.label}
          </span>
          <ChevronRight size={11} className="text-canopy-600" />
        </button>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  iconBg,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  loading: boolean;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-[3px] bg-canopy-600" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={18} color={iconColor} />
          </div>
        </div>
        <p className="text-bark-900 text-2xl font-bold font-display">
          {loading ? "…" : value}
        </p>
        <p className="text-bark-500 text-xs mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

function RegistrationCard({
  item,
  onPress,
}: {
  item: MyRegistration;
  onPress: () => void;
}) {
  const statusCfg =
    {
      registered: "bg-canopy-100 text-canopy-700",
      completed: "bg-parchment-100 text-bark-500",
      cancelled: "bg-rust-100 text-rust-600",
      overdue: "bg-rust-100 text-rust-600",
    }[item.status] ?? "bg-canopy-100 text-canopy-700";

  const dotColor =
    {
      registered: "#366644",
      completed: "#a89b84",
      cancelled: "#a3291f",
      overdue: "#b8790a",
    }[item.status] ?? "#366644";

  return (
    <button
      onClick={onPress}
      className="w-full bg-white rounded-xl overflow-hidden border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] hover:shadow-md transition-shadow text-left"
    >
      <div className="flex flex-row">
        <div className="w-1" style={{ backgroundColor: dotColor }} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <p className="text-bark-900 text-sm font-bold leading-5 line-clamp-2 font-display">
                {item.route_name}
              </p>
              <p className="text-canopy-700 text-[11px] font-bold mt-0.5">
                {item.permit_number}
              </p>
            </div>
            <span
              className={`flex items-center px-2.5 py-1 rounded-full ${statusCfg}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-[10px] font-bold capitalize ml-1.5">
                {item.status}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-bark-500 text-xs">
              {new Date(item.planned_entry).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-bark-500 text-xs">
              {item.group_size} {item.group_size === 1 ? "person" : "people"}
            </span>
            {item.age != null && (
              <span className="text-bark-500 text-xs">{item.age} yrs</span>
            )}
            {item.citizen && (
              <span className="text-bark-500 text-xs">{item.citizen}</span>
            )}
            {item.place && (
              <span className="text-bark-500 text-xs">{item.place}</span>
            )}
            <span className="text-bark-500 text-xs">{item.pax} pax</span>
          </div>
        </div>
        <ChevronRight size={14} className="text-bark-300 mr-3 self-center" />
      </div>
    </button>
  );
}

export default function Dashboard() {
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [regLoading, setRegLoading] = useState(true);
  const [regError, setRegError] = useState(false);

  const [sessions, setSessions] = useState<TrekkingSessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState(false);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const res = await fetch("/api/tourism/my-registrations");
        const data = await res.json();
        setRegistrations(Array.isArray(data.results) ? data.results : []);
      } catch {
        setRegError(true);
      } finally {
        setRegLoading(false);
      }
    };

    const loadSessions = async () => {
      try {
        const res = await fetch("/api/user/trekking-session");
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      } catch {
        // silent — sessions stat just won't populate
      } finally {
        setSessionsLoading(false);
      }
    };

    const loadRoutes = async () => {
      try {
        const res = await fetch("/api/navigation/trekroute");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRoutes(Array.isArray(data) ? data : []);
      } catch {
        setRoutesError(true);
      } finally {
        setRoutesLoading(false);
      }
    };

    loadRegistrations();
    loadSessions();
    loadRoutes();
  }, []);

  const activeSessionsCount = sessions.filter((s) => s.is_active).length;
  const completedTreksCount = sessions.filter((s) => !s.is_active).length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const registrationsThisWeek = registrations.filter(
    (r) => new Date(r.planned_entry) >= weekAgo,
  ).length;

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
            Overview
          </p>
          <h1 className="text-white text-3xl lg:text-5xl font-display font-bold mt-1 leading-none">
            Tourism Dashboard
          </h1>
          <div className="flex items-center gap-1.5 mt-3">
            <Map size={14} className="text-canopy-300" />
            <span className="text-canopy-200 text-sm">
              San Marcelino Tourism Management
            </span>
          </div>
        </div>

        {/* ── Stat Cards Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="My Registrations"
            value={registrations.length}
            loading={regLoading}
            iconBg="#e2eee2"
            iconColor="#366644"
          />
          <StatCard
            icon={Footprints}
            label="Active Sessions"
            value={activeSessionsCount}
            loading={sessionsLoading}
            iconBg="#e2eee2"
            iconColor="#366644"
          />
          <StatCard
            icon={Calendar}
            label="Registered This Week"
            value={registrationsThisWeek}
            loading={regLoading}
            iconBg="#f5ded0"
            iconColor="#b5511f"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Treks"
            value={completedTreksCount}
            loading={sessionsLoading}
            iconBg="#f4f1e4"
            iconColor="#6f6350"
          />
        </div>

        {/* ── Content Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Route Status */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <div className="p-5">
              <SectionHeading icon={Map} label="Route Status" />

              {routesLoading && (
                <div className="flex flex-col items-center py-8">
                  <div className="w-5 h-5 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
                </div>
              )}

              {routesError && !routesLoading && (
                <div className="bg-rust-100/50 border border-rust-100 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={16} className="text-rust-500" />
                  <span className="flex-1 text-xs text-rust-600">
                    Could not load route status.
                  </span>
                </div>
              )}

              {!routesLoading && !routesError && (
                <div className="space-y-1">
                  {routes.map((route, idx) => {
                    const cfg = ROUTE_STATUS[route.status] ?? ROUTE_STATUS.open;
                    return (
                      <div
                        key={route.id}
                        className={`flex items-center justify-between px-4 py-3.5 ${
                          idx < routes.length - 1 ? "border-b border-bark-100" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cfg.dotColor }}
                          />
                          <div>
                            <p className="text-bark-900 text-sm font-semibold font-display">
                              {route.campsite_name}
                            </p>
                            <p className="text-bark-500 text-[11px]">
                              {route.total_distance_km} km
                            </p>
                          </div>
                        </div>
                        <span
                          className={`flex items-center px-3 py-1 rounded-full ${cfg.bg}`}
                        >
                          <span className={`text-xs font-bold ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* My Registrations */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-rust-500" />
            <div className="p-5">
              <SectionHeading
                icon={FileText}
                label="My Registrations"
                action={{
                  label: "See all",
                  onPress: () => {
                    window.location.href = "/my-registrations";
                  },
                }}
              />

              {regLoading && (
                <div className="flex flex-col items-center py-8">
                  <div className="w-5 h-5 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
                  <p className="text-bark-500 text-xs mt-2">
                    Loading registrations…
                  </p>
                </div>
              )}

              {regError && !regLoading && (
                <div className="bg-rust-100/50 border border-rust-100 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle size={16} className="text-rust-500" />
                  <span className="flex-1 text-xs text-rust-600">
                    Could not load registrations.
                  </span>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-rust-600 font-bold"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!regLoading && !regError && registrations.length === 0 && (
                <div className="flex flex-col items-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-parchment-100 flex items-center justify-center mb-3">
                    <FileText size={24} className="text-bark-300" />
                  </div>
                  <p className="text-bark-500 text-sm text-center">
                    No active registrations yet.
                  </p>
                  <Link
                    href="/routes"
                    className="mt-3 bg-canopy-700/10 border border-canopy-700/20 px-5 py-2.5 rounded-xl hover:bg-canopy-700/20 transition-colors"
                  >
                    <span className="text-canopy-700 text-xs font-bold">
                      Register for a Route
                    </span>
                  </Link>
                </div>
              )}

              {!regLoading && !regError && registrations.length > 0 && (
                <div className="space-y-2.5">
                  {registrations.slice(0, 3).map((item) => (
                    <RegistrationCard
                      key={item.id}
                      item={item}
                      onPress={() => {
                        window.location.href = `/registration-detail?permit=${item.permit_number}`;
                      }}
                    />
                  ))}
                  {registrations.length > 3 && (
                    <Link
                      href="/my-registrations"
                      className="flex items-center justify-center gap-2 bg-canopy-700/10 border border-canopy-700/20 rounded-xl py-3 hover:bg-canopy-700/20 transition-colors"
                    >
                      <span className="text-canopy-700 text-xs font-bold">
                        View all {registrations.length} registrations
                      </span>
                      <ChevronRight size={13} className="text-canopy-600" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabLayout>
  );
}