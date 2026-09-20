"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  FileText,
  MapPin,
  QrCode,
  RefreshCw,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> =
  {
    registered: {
      bg: "bg-canopy-100",
      text: "text-canopy-700",
      dot: "#22c55e",
    },
    completed: { bg: "bg-parchment-100", text: "text-bark-500", dot: "#94a3b8" },
    cancelled: { bg: "bg-rust-100", text: "text-rust-600", dot: "#ef4444" },
    overdue: { bg: "bg-amber-100", text: "text-amber-700", dot: "#f59e0b" },
  };

const DIFFICULTY_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  easy: { bg: "bg-canopy-100", text: "text-canopy-700", label: "Easy" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  moderate: { bg: "bg-sky-100", text: "text-sky-700", label: "Moderate" },
  hard: { bg: "bg-orange-100", text: "text-orange-700", label: "Hard" },
  expert: { bg: "bg-rust-100", text: "text-rust-600", label: "Expert" },
};

function InfoRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-row items-start gap-3 py-3 border-b border-bark-100">
      <div className="w-8 h-8 rounded-lg bg-parchment-100 flex items-center justify-center mt-0.5">
        <Icon size={14} color="#6f6350" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-bark-500 uppercase tracking-[0.5px] mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-semibold ${highlight ? "text-canopy-700" : "text-bark-900"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface RegistrationDetail {
  id: number;
  permit_number: string;
  profile_id: number;
  full_name: string;
  route: {
    id: number;
    name: string;
    difficulty: string;
    status: string;
    total_distance_km: string;
  };
  status: string;
  group_size: number;
  age: number | null;
  citizen: string | null;
  place: string | null;
  pax: number;
  planned_entry: string;
  planned_exit: string;
  actual_entry: string | null;
  actual_exit: string | null;
  is_overdue: boolean;
  trek_duration: string | null;
  notes: string;
  registered_at: string;
  updated_at: string;
}

function RegistrationDetailContent() {
  const { refreshUserIn } = useAuth();
  const searchParams = useSearchParams();
  const permit = searchParams.get("permit");

  const [detail, setDetail] = useState<RegistrationDetail | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!permit) return;
      try {
        const res = await fetch(`/api/tourism/registrations/${permit}`);
        const data = await res.json();
        setDetail(data);
      } catch {
        setError("Failed to load registration details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [permit]);

  const handleRegenerateQr = async () => {
    if (!permit) return;
    try {
      setQrLoading(true);
      // Ensure access token is fresh before the protected QR call
      await refreshUserIn();
      const res = await fetch(`/api/tourism/registrations/${permit}/qr`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setQrBase64(data.qr_code);
      }
    } catch {
      alert("Failed to regenerate QR code. Please try again.");
    } finally {
      setQrLoading(false);
    }
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <TabLayout>
        <div className="min-h-screen bg-topo flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
          <p className="text-bark-500 text-sm mt-3">Loading registration…</p>
        </div>
      </TabLayout>
    );
  }

  if (error || !detail) {
    return (
      <TabLayout>
        <div className="min-h-screen bg-topo flex flex-col items-center justify-center px-8">
          <div className="w-14 h-14 rounded-2xl bg-rust-100 flex items-center justify-center mb-4">
            <AlertTriangle size={28} color="#a3291f" />
          </div>
          <p className="text-bark-700 font-bold text-lg font-display text-center">
            {error ?? "Registration not found"}
          </p>
          <Link
            href="/my-registrations"
            className="mt-6 bg-canopy-700 px-6 py-3 rounded-xl hover:bg-canopy-800 transition-colors"
          >
            <span className="text-white font-bold">Go Back</span>
          </Link>
        </div>
      </TabLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.registered;
  const diffCfg =
    DIFFICULTY_CONFIG[detail.route.difficulty] ?? DIFFICULTY_CONFIG.easy;

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Link
                href="/my-registrations"
                className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 transition-colors flex items-center justify-center shrink-0 mt-1"
              >
                <ArrowLeft size={18} className="text-canopy-200" />
              </Link>
              <div>
                <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                  Tourism
                </p>
                <h1 className="text-white text-3xl lg:text-4xl font-display font-bold mt-1 leading-tight">
                  Registration Detail
                </h1>
                <div className="mt-3 bg-white/10 border border-white/10 rounded-xl px-4 py-2 inline-flex">
                  <p className="text-canopy-300 text-[10px] font-bold uppercase tracking-[1px]">
                    Permit
                  </p>
                  <p className="text-white text-sm font-extrabold tracking-wider ml-2">
                    {detail.permit_number}
                  </p>
                </div>
              </div>
            </div>

            <span
              className={`flex items-center px-3.5 py-2 rounded-full shrink-0 self-start ${statusCfg.bg}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusCfg.dot }}
              />
              <span
                className={`text-xs font-bold capitalize ml-2 ${statusCfg.text}`}
              >
                {detail.status}
              </span>
            </span>
          </div>
        </div>

        {/* ── QR Code Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden mb-6">
          <div className="h-[3px] bg-canopy-600" />
          <div className="p-6 flex flex-col items-center">
            <p className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-500 mb-5">
              Entry QR Code
            </p>
            {qrBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${qrBase64}`}
                alt="QR Code"
                className="w-48 h-48 rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 rounded-xl bg-parchment-100 border-2 border-dashed border-bark-300 flex flex-col items-center justify-center">
                <QrCode size={48} color="#a89b84" />
                <p className="text-bark-500 text-xs mt-2 text-center px-4">
                  Tap below to generate your QR code
                </p>
              </div>
            )}
            <button
              onClick={handleRegenerateQr}
              disabled={qrLoading}
              className="mt-5 flex items-center gap-2 bg-canopy-700 px-6 py-3 rounded-xl text-white text-sm font-bold hover:bg-canopy-800 transition-colors"
              style={{ opacity: qrLoading ? 0.7 : 1 }}
            >
              {qrLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshCw size={15} className="text-white" />
              )}
              <span>
                {qrBase64 ? "Regenerate QR Code" : "Generate QR Code"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Route Card ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-white" />
            </div>
            <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
              Route
            </span>
          </div>
          <p className="text-bark-900 text-base font-bold font-display mb-3">
            {detail.route.name}
          </p>
          <div className="flex flex-row flex-wrap gap-2">
            <span
              className={`flex items-center px-2.5 py-1 rounded-full ${diffCfg.bg}`}
            >
              <TrendingUp size={11} color="#6f6350" />
              <span className={`text-[11px] font-bold ml-1 ${diffCfg.text}`}>
                {diffCfg.label}
              </span>
            </span>
            <span className="flex items-center bg-parchment-100 px-2.5 py-1 rounded-full">
              <MapPin size={11} color="#6f6350" />
              <span className="text-bark-600 text-[11px] font-bold ml-1">
                {detail.route.total_distance_km} km
              </span>
            </span>
            <span
              className={`flex items-center px-2.5 py-1 rounded-full ${detail.route.status === "open" ? "bg-canopy-100" : "bg-rust-100"}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    detail.route.status === "open" ? "#22c55e" : "#ef4444",
                }}
              />
              <span
                className={`text-[11px] font-bold capitalize ml-1 ${detail.route.status === "open" ? "text-canopy-700" : "text-rust-600"}`}
              >
                {detail.route.status}
              </span>
            </span>
          </div>
        </div>

        {/* ── Travel Details ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden px-5 pb-3 mb-4">
          <div className="flex items-center gap-3 pt-5 pb-2">
            <div className="w-8 h-8 rounded-lg bg-bark-700 flex items-center justify-center shrink-0">
              <Users size={15} className="text-white" />
            </div>
            <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
              Travel Details
            </span>
          </div>
          <InfoRow icon={Users} label="Full Name" value={detail.full_name} />
          <InfoRow
            icon={Users}
            label="Group Size"
            value={`${detail.group_size} ${detail.group_size === 1 ? "person" : "people"}`}
          />
          {detail.age != null && (
            <InfoRow icon={Users} label="Age" value={`${detail.age} years`} />
          )}
          {detail.citizen && (
            <InfoRow icon={Users} label="Citizenship" value={detail.citizen} />
          )}
          {detail.place && (
            <InfoRow icon={MapPin} label="Place" value={detail.place} />
          )}
          <InfoRow
            icon={Users}
            label="Pax"
            value={`${detail.pax} ${detail.pax === 1 ? "member" : "members"}`}
          />
          <InfoRow
            icon={Clock}
            label="Planned Entry"
            value={formatDateTime(detail.planned_entry)}
          />
          <InfoRow
            icon={Clock}
            label="Planned Exit"
            value={formatDateTime(detail.planned_exit)}
          />
          {detail.actual_entry && (
            <InfoRow
              icon={TrendingUp}
              label="Actual Entry"
              value={formatDateTime(detail.actual_entry)}
              highlight
            />
          )}
          {detail.actual_exit && (
            <InfoRow
              icon={MapPin}
              label="Actual Exit"
              value={formatDateTime(detail.actual_exit)}
              highlight
            />
          )}
          {detail.trek_duration && (
            <InfoRow
              icon={Clock}
              label="Trek Duration"
              value={detail.trek_duration}
            />
          )}
          <InfoRow
            icon={FileText}
            label="Registered At"
            value={formatDateTime(detail.registered_at)}
          />

          {detail.is_overdue && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 my-3">
              <AlertTriangle size={16} color="#d97706" className="shrink-0" />
              <p className="text-amber-700 text-xs font-bold flex-1">
                This travel is overdue. Please contact the ranger station.
              </p>
            </div>
          )}

          {detail.notes && (
            <div className="py-3">
              <p className="text-[10px] font-bold text-bark-500 uppercase tracking-[0.5px] mb-1.5">
                Notes
              </p>
              <div className="bg-parchment-100 rounded-xl p-3 border border-bark-100">
                <p className="text-bark-600 text-sm leading-5">
                  {detail.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TabLayout>
  );
}

export default function RegistrationDetail() {
  return (
    <Suspense
      fallback={
        <TabLayout>
          <div className="min-h-screen bg-topo flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
              <p className="text-bark-500 text-xs">Loading registration…</p>
            </div>
          </div>
        </TabLayout>
      }
    >
      <RegistrationDetailContent />
    </Suspense>
  );
}