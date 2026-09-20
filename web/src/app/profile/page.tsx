"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Footprints,
  Info,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface TrekkingSessionItem {
  id: number;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  route: number;
}

interface RouteListItem {
  id: number;
  total_distance_km: string;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-bark-100">
      <div className="w-8 h-8 rounded-lg bg-parchment-100 flex items-center justify-center">
        <Icon size={14} className="text-bark-500" />
      </div>
      <span className="text-bark-500 text-sm flex-1">{label}</span>
      <span className="text-bark-900 text-sm font-semibold">{value}</span>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onPress,
  danger,
  iconBg,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-bark-100 hover:bg-parchment-100 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: danger ? "#f5ded0" : (iconBg ?? "#f4f1e4") }}
      >
        <Icon size={16} color={danger ? "#b5511f" : (iconColor ?? "#6f6350")} />
      </div>
      <span
        className={`flex-1 text-sm font-semibold ${danger ? "text-rust-500" : "text-bark-900"}`}
      >
        {label}
      </span>
      {!danger && <ChevronRight size={16} className="text-bark-300" />}
    </button>
  );
}

function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
      <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-white" />
      </div>
      <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
        {label}
      </span>
    </div>
  );
}

function ProfileStat({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center mb-0.5">
        <Icon size={16} className="text-white" />
      </div>
      <span className="text-white text-sm font-bold">{value}</span>
      <span className="text-canopy-300 text-[10px] font-medium">{label}</span>
    </div>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

  const [registrationCount, setRegistrationCount] = useState<number | null>(
    null,
  );
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/tourism/my-registrations")
      .then((res) => res.json())
      .then((data) => setRegistrationCount(data.count ?? 0))
      .catch(() => setRegistrationCount(null));

    const loadTrekStats = async () => {
      try {
        const [sessionsRes, routesRes] = await Promise.all([
          fetch("/api/user/trekking-session"),
          fetch("/api/navigation/trekroute"),
        ]);
        const sessions: TrekkingSessionItem[] = await sessionsRes.json();
        const routes: RouteListItem[] = routesRes.ok
          ? await routesRes.json()
          : [];

        const completed = Array.isArray(sessions)
          ? sessions.filter((s) => !s.is_active)
          : [];
        setCompletedCount(completed.length);

        const routeDistanceById = new Map(
          routes.map((r) => [r.id, parseFloat(r.total_distance_km) || 0]),
        );
        const distance = completed.reduce(
          (sum, s) => sum + (routeDistanceById.get(s.route) ?? 0),
          0,
        );
        setTotalDistanceKm(distance);
      } catch {
        setCompletedCount(null);
        setTotalDistanceKm(null);
      }
    };
    loadTrekStats();
  }, []);

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: "Sign out?",
      text: "Are you sure you want to end your session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, sign out",
      confirmButtonColor: "#b5511f",
      cancelButtonColor: "#6f6350",
      background: "#fbfaf3",
      showCloseButton: true,
    });
    if (result.isConfirmed) {
      await signOut();
    }
  };

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-canopy-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl lg:text-4xl font-bold font-display">
                  {initial}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-canopy-400 border-2 border-canopy-800" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-2xl lg:text-3xl font-bold font-display">
                {user?.username}
              </h1>
              <p className="text-canopy-300 text-sm mt-1">{user?.email}</p>
              <div className="flex items-center mt-3 bg-white/10 px-4 py-1.5 rounded-full w-fit">
                <ShieldCheck size={13} className="text-canopy-300" />
                <span className="text-canopy-200 text-xs font-semibold ml-1.5">
                  Registered User
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-6 lg:gap-8 pt-4 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-8">
              <ProfileStat
                icon={Footprints}
                value={registrationCount === null ? "…" : String(registrationCount)}
                label="Registrations"
              />
              <ProfileStat
                icon={MapPin}
                value={
                  totalDistanceKm === null
                    ? "…"
                    : `${totalDistanceKm.toFixed(1)} km`
                }
                label="Distance"
              />
              <ProfileStat
                icon={CheckCircle2}
                value={completedCount === null ? "…" : String(completedCount)}
                label="Completed"
              />
            </div>
          </div>
        </div>

        {/* ── Content Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <SectionHeading icon={User} label="Personal Information" />
            <div className="px-4 pb-2">
              <InfoRow
                icon={User}
                label="Full Name"
                value={user?.username ?? "-"}
              />
              <InfoRow icon={Mail} label="Email" value={user?.email ?? "-"} />
              <InfoRow icon={Phone} label="Phone" value={user?.phone ?? "-"} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-rust-500" />
            <SectionHeading icon={AlertTriangle} label="Emergency Contact" />
            <div className="px-4 pb-2">
              <InfoRow
                icon={User}
                label="Contact Name"
                value={user?.emergency_contact_name || "Not set"}
              />
              <InfoRow
                icon={Phone}
                label="Contact Number"
                value={user?.emergency_contact_phone || "Not set"}
              />
            </div>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden lg:col-span-2">
            <div className="h-[3px] bg-canopy-600" />
            <SectionHeading icon={Settings} label="Menu" />
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="opacity-40 pointer-events-none">
                <MenuItem
                  icon={Footprints}
                  label="My Travel History"
                  iconBg="#e2eee2"
                  iconColor="#366644"
                  onPress={() => {}}
                />
                <MenuItem
                  icon={AlertTriangle}
                  label="Emergency Contacts"
                  iconBg="#f5ded0"
                  iconColor="#b5511f"
                  onPress={() => {
                    window.location.href = "/emergency";
                  }}
                />
              </div>
              <div className="opacity-40 pointer-events-none">
                <MenuItem
                  icon={Settings}
                  label="App Settings"
                  iconBg="#f4f1e4"
                  iconColor="#6f6350"
                  onPress={() => {}}
                />
                <MenuItem
                  icon={Info}
                  label="About Mapanuepe Trail"
                  iconBg="#e2eee2"
                  iconColor="#366644"
                  onPress={() => {}}
                />
              </div>
            </div>
            <div className="border-t border-bark-100">
              <MenuItem
                icon={LogOut}
                label="Sign Out"
                onPress={handleSignOut}
                danger
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center gap-1 py-4 lg:col-span-2">
            <div className="flex items-center gap-1.5">
              <Leaf size={12} className="text-bark-300" />
              <span className="text-bark-500 text-xs font-medium">
                Mapanuepe Trail v1.0.0
              </span>
            </div>
            <span className="text-bark-300 text-[11px]">
              San Marcelino, Zambales
            </span>
          </div>
        </div>
      </div>
    </TabLayout>
  );
}