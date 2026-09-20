"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Activity,
  AlertOctagon,
  CheckCircle,
  Clock,
  List,
  LogIn,
  LogOut,
  LogOut as LogOutIcon,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  Siren,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type HazardAlert = {
  session_id: number;
  trekker_name: string;
  route_id: number;
  route_name: string;
  checkpoint_name: string;
  cp_type: string;
  alert_message: string;
  distance_meters: number;
  recorded_at: string;
};

type SosAlert = {
  id: number;
  profile_id: number;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  status: string;
  created_at: string;
  trekker: {
    name: string;
    username: string;
    phone: string | null;
    emergency_contact_phone: string | null;
  };
};

function StatCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent: "green" | "blue" | "orange";
}) {
  const iconBg = {
    green: "bg-green-400/20",
    blue: "bg-blue-400/20",
    orange: "bg-orange-400/20",
  }[accent];
  const iconColor = { green: "#4cde80", blue: "#60a5fa", orange: "#fb923c" }[
    accent
  ];
  return (
    <div className="flex-1 rounded-2xl p-5 mx-1 bg-white/10 border border-white/10 min-w-0">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}
      >
        <Icon size={18} color={iconColor} />
      </div>
      <p className="text-white text-2xl font-extrabold">{value}</p>
      <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function Section({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-8">
      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
        <Icon size={14} color="#15803d" />
      </div>
      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  variant,
  href,
}: {
  icon: LucideIcon;
  label: string;
  variant: "green" | "blue" | "orange";
  href: string;
}) {
  const cardBg = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    orange: "bg-orange-50",
  }[variant];
  const iconBg = {
    green: "bg-green-100",
    blue: "bg-blue-100",
    orange: "bg-orange-100",
  }[variant];
  const iconColor = { green: "#15803d", blue: "#1d4ed8", orange: "#c2410c" }[
    variant
  ];
  const textColor = {
    green: "text-green-700",
    blue: "text-blue-700",
    orange: "text-orange-700",
  }[variant];
  return (
    <Link
      href={href}
      className={`flex-1 rounded-2xl py-6 flex flex-col items-center mx-1 ${cardBg} hover:shadow-md transition-shadow`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}
      >
        <Icon size={22} color={iconColor} />
      </div>
      <span className={`mt-2 text-sm font-bold text-center ${textColor}`}>
        {label}
      </span>
    </Link>
  );
}

export default function RangerDashboard() {
  const { user, signOut } = useAuth();
  const [dashboard, setDashboard] = useState<{
    active_trekkers?: number;
    entries_today?: number;
    exits_today?: number;
    hazard_alerts?: HazardAlert[];
    sos_alerts?: SosAlert[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tourism/ranger/dashboard");
        const data = await res.json();
        setDashboard(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
    // Hazard alerts are time-sensitive — refresh periodically so rangers
    // see new ones without a manual reload.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const hazardAlerts = dashboard?.hazard_alerts ?? [];
  const sosAlerts = dashboard?.sos_alerts ?? [];

  const handleResolveSos = async (alertId: number) => {
    const result = await Swal.fire({
      title: "Resolve SOS alert?",
      text: "Mark this SOS as resolved after confirming the trekker is safe.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Resolve",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6f6350",
      background: "#fbfaf3",
      showCloseButton: true,
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`/api/emergency/sos/${alertId}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setDashboard((prev) =>
          prev
            ? {
                ...prev,
                sos_alerts: (prev.sos_alerts ?? []).filter(
                  (a) => a.id !== alertId,
                ),
              }
            : prev,
        );
        Swal.fire({
          title: "SOS Resolved",
          text: "The SOS alert has been marked as resolved.",
          icon: "success",
          confirmButtonColor: "#366644",
          background: "#fbfaf3",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-2xl p-6 lg:p-8 shadow-lg mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-400/15 border border-green-400/25">
              <ShieldCheck size={26} color="#4cde80" />
            </div>
            <div>
              <p className="text-green-400 text-[11px] font-bold uppercase tracking-widest">
                {greeting}
              </p>
              <h1 className="text-white text-2xl lg:text-3xl font-extrabold mt-0.5 tracking-tight">
                {user?.first_name || user?.username || "Ranger"}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs font-semibold">
                  On Duty · Park Ranger
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-row gap-2">
              <StatCard
                icon={Users}
                value={dashboard?.active_trekkers ?? "—"}
                label="Active"
                accent="green"
              />
              <StatCard
                icon={LogIn}
                value={dashboard?.entries_today ?? "—"}
                label="Entries"
                accent="blue"
              />
              <StatCard
                icon={LogOut}
                value={dashboard?.exits_today ?? "—"}
                label="Exits"
                accent="orange"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl">
        {/* ── Active SOS Alerts ─────────────────────────────────────────── */}
        {!loading && sosAlerts.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                <Siren size={14} color="#e11d48" />
              </div>
              <span className="text-rose-600 text-xs font-bold uppercase tracking-widest">
                Active SOS Alerts
              </span>
              <span className="ml-auto bg-rose-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-rose-700">
                {sosAlerts.length}
              </span>
            </div>
            <div className="space-y-3 mb-6">
              {sosAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <Siren size={18} color="#e11d48" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-rose-800 text-sm font-bold truncate">
                        {alert.trekker.name}
                      </p>
                      <span className="text-rose-500 text-[11px] font-semibold shrink-0">
                        {new Date(alert.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-rose-600 text-xs mt-0.5">
                      @{alert.trekker.username}
                    </p>
                    {alert.latitude != null && alert.longitude != null && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin size={10} color="#e11d48" />
                        <span className="text-rose-500 text-[10px] font-mono">
                          {alert.latitude.toFixed(5)}°,{" "}
                          {alert.longitude.toFixed(5)}°
                        </span>
                      </div>
                    )}
                    {alert.message && (
                      <p className="text-rose-700 text-xs mt-1.5 leading-4">
                        {alert.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2.5">
                      {alert.trekker.phone && (
                        <a
                          href={`tel:${alert.trekker.phone}`}
                          className="flex items-center gap-1 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          <Phone size={10} />
                          Call
                        </a>
                      )}
                      {alert.trekker.emergency_contact_phone && (
                        <a
                          href={`tel:${alert.trekker.emergency_contact_phone}`}
                          className="flex items-center gap-1 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          <Phone size={10} />
                          Emergency
                        </a>
                      )}
                      <button
                        onClick={() => handleResolveSos(alert.id)}
                        className="flex items-center gap-1 bg-green-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg ml-auto"
                      >
                        <CheckCircle size={10} />
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && hazardAlerts.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertOctagon size={14} color="#dc2626" />
              </div>
              <span className="text-red-600 text-xs font-bold uppercase tracking-widest">
                Active Hazard Alerts
              </span>
              <span className="ml-auto bg-red-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-red-700">
                {hazardAlerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {hazardAlerts.map((alert, i) => (
                <div
                  key={`${alert.session_id}-${alert.checkpoint_name}-${i}`}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertOctagon size={18} color="#dc2626" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-red-800 text-sm font-bold truncate">
                        {alert.trekker_name}
                      </p>
                      <span className="text-red-500 text-[11px] font-semibold shrink-0">
                        {alert.distance_meters}m away
                      </span>
                    </div>
                    <p className="text-red-600 text-xs mt-0.5">
                      {alert.route_name} · near {alert.checkpoint_name}
                    </p>
                    <p className="text-red-700 text-xs mt-1.5 leading-4">
                      {alert.alert_message}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <MapPin size={10} color="#dc2626" />
                      <span className="text-red-400 text-[10px]">
                        Last seen{" "}
                        {new Date(alert.recorded_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <Section label="Quick Actions" icon={Activity} />
        <div className="flex flex-row gap-3">
          <QuickAction
            icon={QrCode}
            label="Scan Entry"
            variant="green"
            href="/ranger/scan"
          />
          <QuickAction
            icon={LogOutIcon}
            label="Scan Exit"
            variant="blue"
            href="/ranger/scan"
          />
          <QuickAction
            icon={List}
            label="Tourist"
            variant="orange"
            href="/ranger/registrations"
          />
        </div>

        <Section label="Duty Status" icon={Clock} />
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-50">
            <CheckCircle size={24} color="#16a34a" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 text-[15px] font-bold">Active Shift</p>
            <p className="text-gray-400 text-sm mt-0.5">
              You are currently on duty and monitoring the park.
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="mt-8 w-full max-w-md flex items-center justify-center rounded-xl py-3.5 bg-rose-100 border border-rose-200 hover:bg-rose-200 transition-colors"
        >
          <LogOutIcon size={18} color="#e11d48" />
          <span className="text-rose-600 text-sm font-bold mx-2">
            End Duty & Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}