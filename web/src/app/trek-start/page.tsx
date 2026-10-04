"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Info,
  MapPin,
  Minus,
  Navigation,
  Plus,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Swal from "sweetalert2";

const DIFF_GRADIENT: Record<string, [string, string]> = {
  easy: ["#15803d", "#22c55e"],
  moderate: ["#0369a1", "#2563eb"],
  hard: ["#c2410c", "#f97316"],
  expert: ["#b91c1c", "#ef4444"],
};

type Step = "register" | "qr" | "starting";

function toLocalISO(
  dateStr: string,
  timeStr: string,
  tzOffset = "+08:00",
): string {
  return `${dateStr}T${timeStr}:00${tzOffset}`;
}

// YYYY-MM-DD in Manila time (consistent with the +08:00 offset in toLocalISO).
// Avoid toISOString() here: it's UTC, so between 12AM-8AM PH time it returns "yesterday".
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(
    new Date(),
  );
}

function TrekStartContent() {
  const router = useRouter();
  const { refreshUserIn } = useAuth();
  const searchParams = useSearchParams();
  const routeId = searchParams.get("routeId");
  const routeName = searchParams.get("routeName")
    ? decodeURIComponent(searchParams.get("routeName")!)
    : "Route";
  const routeDifficulty = searchParams.get("routeDifficulty")
    ? decodeURIComponent(searchParams.get("routeDifficulty")!)
    : "moderate";

  const gradient =
    DIFF_GRADIENT[routeDifficulty.toLowerCase()] ?? DIFF_GRADIENT.moderate;

  const [entryDate, setEntryDate] = useState(today());
  const [entryTime, setEntryTime] = useState("06:00");
  const [exitDate, setExitDate] = useState(today());
  const [exitTime, setExitTime] = useState("14:00");
  const [age, setAge] = useState("");
  const [citizen, setCitizen] = useState("");
  const [place, setPlace] = useState("");
  const [pax, setPax] = useState("1");
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<Step>("register");
  const [loading, setLoading] = useState(false);
  const [startingTrek, setStartingTrek] = useState(false);
  const [registration, setRegistration] = useState<{
    permit_number: string;
    qr_code: string;
    registration: {
      planned_entry: string;
      planned_exit: string;
      group_size: number;
      age: number | null;
      citizen: string | null;
      place: string | null;
      pax: number;
    };
  } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!routeId) {
      errors.route = "No route selected. Please go back and pick a route.";
    }
    if (!entryDate) errors.entryDate = "Required";
    if (!entryTime) errors.entryTime = "Required";
    if (!exitDate) errors.exitDate = "Required";
    if (!exitTime) errors.exitTime = "Required";
    if (entryDate && entryDate < today())
      errors.entryDate = "Entry date can't be in the past";
    if (exitDate && entryDate && exitDate < entryDate)
      errors.exitDate = "Exit date can't be before entry date";
    const a = parseInt(age);
    if (!age || isNaN(a) || a < 1) errors.age = "Required";
    if (a > 120) errors.age = "Invalid age";
    if (!citizen.trim()) errors.citizen = "Required";
    if (!place.trim()) errors.place = "Required";
    const px = parseInt(pax);
    if (!pax || isNaN(px) || px < 1) errors.pax = "Must be at least 1";
    if (px > 50) errors.pax = "Maximum is 50";
    if (entryDate && entryTime && exitDate && exitTime) {
      const entry = new Date(toLocalISO(entryDate, entryTime));
      const exit = new Date(toLocalISO(exitDate, exitTime));
      if (exit <= entry) errors.exitTime = "Exit must be after entry";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Ensure the access token is fresh before the protected registration call.
      // The access token expires after 15 min; the backend returns 401
      // ("Authentication required") if it's stale. Refreshing first prevents that.
      await refreshUserIn();

      const res = await fetch("/api/tourism/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route_id: Number(routeId),
          planned_entry: toLocalISO(entryDate, entryTime),
          planned_exit: toLocalISO(exitDate, exitTime),
          // Group Size was removed from the UI; keep it in sync with pax
          // since the backend/DB still stores group_size.
          group_size: parseInt(pax),
          age: parseInt(age),
          citizen: citizen.trim(),
          place: place.trim(),
          pax: parseInt(pax),
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegistration(data);
        setStep("qr");
        setShowQr(true);
        Swal.fire({
          title: "Registration Complete!",
          text: "Your travel pass has been issued. Show the QR code at the trailhead.",
          icon: "success",
          confirmButtonColor: "#366644",
          background: "#fbfaf3",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "Registration Failed",
          text: data.detail || "Please try again.",
          icon: "error",
          confirmButtonColor: "#b5511f",
          background: "#fbfaf3",
        });
      }
    } catch {
      Swal.fire({
        title: "Registration Failed",
        text: "Please try again.",
        icon: "error",
        confirmButtonColor: "#b5511f",
        background: "#fbfaf3",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrek = async () => {
    setStartingTrek(true);
    try {
      await refreshUserIn();
      const res = await fetch("/api/user/trekking-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route_id: Number(routeId) }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        Swal.fire({
          title: "Could Not Start",
          text: data.detail || "Please try again.",
          icon: "error",
          confirmButtonColor: "#b5511f",
          background: "#fbfaf3",
        });
        return;
      }

      setShowQr(false);
      setStep("starting");
      Swal.fire({
        title: "Travel Started!",
        text: "Your trekking session is now active. Stay safe on the trail!",
        icon: "success",
        confirmButtonColor: "#366644",
        background: "#fbfaf3",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      router.push("/trek");
    } catch {
      Swal.fire({
        title: "Could Not Start",
        text: "Please try again.",
        icon: "error",
        confirmButtonColor: "#b5511f",
        background: "#fbfaf3",
      });
    } finally {
      setStartingTrek(false);
    }
  };

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shadow-xl mb-6 bg-expedition">
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
                  Pre-Travel Registration
                </p>
                <h1 className="text-white text-3xl lg:text-4xl font-display font-bold mt-1 leading-tight">
                  {routeName}
                </h1>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="flex items-center px-2.5 py-1 rounded-full text-white text-[11px] font-bold"
                    style={{ backgroundColor: `${gradient[1]}40`, border: `1px solid ${gradient[1]}80` }}
                  >
                    {routeDifficulty}
                  </span>
                  <span className="text-canopy-200 text-sm">
                    Register to get your travel QR code
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 shrink-0 self-start">
              <div className="flex flex-row items-center">
                {(["register", "qr", "starting"] as Step[]).map((s, i) => {
                  const idx = ["register", "qr", "starting"].indexOf(step);
                  const labels = ["Register", "QR Code", "Start"];
                  const icons = [FileText, CheckCircle, Navigation];
                  const Icon = icons[i];
                  return (
                    <div key={s} className="flex flex-row items-center">
                      <div className="flex flex-col items-center w-14">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            i < idx
                              ? "bg-canopy-400"
                              : i === idx
                                ? "bg-rust-500"
                                : "bg-white/10 border border-white/20"
                          }`}
                        >
                          {i < idx ? (
                            <CheckCircle size={15} className="text-white" />
                          ) : (
                            <Icon size={14} className={i === idx ? "text-white" : "text-canopy-300"} />
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-bold mt-1 tracking-[0.5px] uppercase ${i <= idx ? "text-white" : "text-canopy-300"}`}
                        >
                          {labels[i]}
                        </span>
                      </div>
                      {i < 2 && (
                        <div
                          className={`h-[1.5px] w-5 mx-0.5 mb-4 rounded-full ${i < idx ? "bg-canopy-400" : "bg-white/10"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 mb-6 flex flex-row items-start gap-3">
          <Info size={16} color="#0284c7" className="mt-0.5 shrink-0" />
          <p className="flex-1 text-xs text-sky-700 leading-5">
            Registration is required before starting any travel. Your QR code
            will be checked at the trailhead.
          </p>
        </div>

        {!routeId && (
          <div className="bg-rust-100/50 border border-rust-100 rounded-xl px-4 py-3 mb-6 flex flex-row items-start gap-3">
            <Info size={16} color="#a3291f" className="mt-0.5 shrink-0" />
            <p className="flex-1 text-xs text-rust-600 leading-5">
              No route selected. Please go back and choose a route before
              registering.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── Planned Schedule ─────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-white" />
                </div>
                <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
                  Planned Schedule
                </span>
              </div>

              <p className="text-[12px] font-bold text-bark-500 uppercase tracking-[0.8px] mb-2">
                Planned Entry *
              </p>
              <div className="flex flex-row gap-2 mb-4">
                <div className="flex-1">
                  <input
                    type="date"
                    value={entryDate}
                    min={today()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEntryDate(val);
                      // if exit is now earlier than the new entry, move it along
                      if (val && exitDate < val) setExitDate(val);
                    }}
                    className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.entryDate ? "border-rust-400" : "border-bark-100"}`}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="time"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.entryTime ? "border-rust-400" : "border-bark-100"}`}
                  />
                </div>
              </div>
              {fieldErrors.entryDate && (
                <p className="text-rust-500 text-xs -mt-2 mb-3">{fieldErrors.entryDate}</p>
              )}

              <div className="h-px bg-bark-100 my-3" />

              <p className="text-[12px] font-bold text-bark-500 uppercase tracking-[0.8px] mb-2">
                Planned Exit *
              </p>
              <div className="flex flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="date"
                    value={exitDate}
                    min={entryDate || today()}
                    onChange={(e) => setExitDate(e.target.value)}
                    className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.exitDate ? "border-rust-400" : "border-bark-100"}`}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.exitTime ? "border-rust-400" : "border-bark-100"}`}
                  />
                </div>
              </div>
              {fieldErrors.exitDate && (
                <p className="text-rust-500 text-xs mt-2">{fieldErrors.exitDate}</p>
              )}
              {fieldErrors.exitTime && (
                <p className="text-rust-500 text-xs mt-2">{fieldErrors.exitTime}</p>
              )}
            </div>
          </div>

          {/* ── Personal Details ─────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                  <User size={15} className="text-white" />
                </div>
                <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
                  Personal Details
                </span>
              </div>

              <p className="text-[12px] font-bold text-bark-500 uppercase tracking-[0.8px] mb-2">
                Age *
              </p>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 25"
                className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.age ? "border-rust-400" : "border-bark-100"}`}
              />
              {fieldErrors.age && (
                <p className="text-rust-500 text-xs -mt-2 mb-3">{fieldErrors.age}</p>
              )}

              <p className="text-[12px] font-bold text-bark-500 uppercase tracking-[0.8px] mb-2">
                Citizenship *
              </p>
              <input
                type="text"
                value={citizen}
                onChange={(e) => setCitizen(e.target.value)}
                placeholder="e.g. Filipino"
                className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.citizen ? "border-rust-400" : "border-bark-100"}`}
              />
              {fieldErrors.citizen && (
                <p className="text-rust-500 text-xs -mt-2 mb-3">{fieldErrors.citizen}</p>
              )}

              <p className="text-[12px] font-bold text-bark-500 uppercase tracking-[0.8px] mb-2">
                Place of Origin *
              </p>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="e.g. Manila, Philippines"
                className={`w-full bg-parchment-100 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.place ? "border-rust-400" : "border-bark-100"}`}
              />
              {fieldErrors.place && (
                <p className="text-rust-500 text-xs mt-2">{fieldErrors.place}</p>
              )}
            </div>
          </div>

          {/* ── Group Details ────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-rust-500" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-bark-700 flex items-center justify-center shrink-0">
                  <Users size={15} className="text-white" />
                </div>
                <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
                  Group Details
                </span>
              </div>

              <p className="text-[12px] font-bold text-bark-500 uppercase tracking-[0.8px] mb-2">
                Pax (Group Members) *
              </p>
              <div className="flex flex-row items-center gap-3">
                <button
                  onClick={() =>
                    setPax((v) => String(Math.max(1, parseInt(v || "1") - 1)))
                  }
                  className="w-10 h-10 rounded-full bg-parchment-100 border border-bark-100 flex items-center justify-center hover:bg-parchment-200 transition-colors"
                >
                  <Minus size={16} className="text-bark-700" />
                </button>
                <input
                  type="number"
                  value={pax}
                  onChange={(e) => setPax(e.target.value.replace(/[^0-9]/g, ""))}
                  className={`flex-1 bg-parchment-100 border rounded-xl px-3 py-3 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-canopy-400 ${fieldErrors.pax ? "border-rust-400" : "border-bark-100"}`}
                />
                <button
                  onClick={() =>
                    setPax((v) => String(Math.min(50, parseInt(v || "1") + 1)))
                  }
                  className="w-10 h-10 rounded-full bg-parchment-100 border border-bark-100 flex items-center justify-center hover:bg-parchment-200 transition-colors"
                >
                  <Plus size={16} className="text-bark-700" />
                </button>
              </div>
              {fieldErrors.pax && (
                <p className="text-rust-500 text-xs mt-2">{fieldErrors.pax}</p>
              )}
            </div>
          </div>

          {/* ── Notes + Submit ───────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden flex-1">
              <div className="h-[3px] bg-canopy-600" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-white" />
                  </div>
                  <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 flex-1">
                    Notes (Optional)
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. One member has asthma, carrying first aid kit..."
                  className="w-full bg-parchment-100 border border-bark-100 rounded-xl px-3 py-3 text-sm min-h-[110px] resize-none focus:outline-none focus:ring-2 focus:ring-canopy-400"
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !routeId}
              className="w-full rounded-xl overflow-hidden disabled:opacity-60 hover:opacity-95 transition-opacity"
              style={{ boxShadow: `0 6px 14px ${gradient[0]}59` }}
            >
              <div
                className="flex flex-row items-center justify-center gap-2 py-4"
                style={{
                  background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} color="white" />
                    <span className="text-white text-base font-extrabold tracking-wide">
                      Register & Get QR Code
                    </span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* QR Modal */}
        {showQr && registration && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-5">
            <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto max-w-md">
              <div className="bg-canopy-900 px-5 pt-4 pb-6">
                <button
                  onClick={() => setShowQr(false)}
                  className="self-start flex flex-row items-center bg-white/20 px-3 py-1.5 rounded-full mb-4"
                >
                  <span className="text-white text-xs font-semibold">Close</span>
                </button>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[1.5px]">
                  Registration Complete
                </p>
                <h2 className="text-white text-xl font-extrabold font-display mt-1">
                  Your Travel Pass
                </h2>
              </div>
              <div className="px-6 pt-5 pb-8">
                <div className="bg-canopy-50 border border-canopy-200 rounded-xl px-4 py-3 mb-4 flex flex-row items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-canopy-100 flex items-center justify-center">
                    <CheckCircle size={20} className="text-canopy-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-canopy-600 font-bold uppercase tracking-[0.8px]">
                      Registration Number
                    </p>
                    <p className="text-canopy-800 text-base font-extrabold tracking-wider">
                      {registration.permit_number}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-bark-100 rounded-3xl p-5 mb-4 flex flex-col items-center shadow-sm">
                  <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[1px] mb-4">
                    Scan at trailhead checkpoint
                  </p>
                  {registration.qr_code && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`data:image/png;base64,${registration.qr_code}`}
                      alt="QR Code"
                      className="w-[200px] h-[200px]"
                    />
                  )}
                  <p className="text-[10px] text-bark-500 mt-4 text-center leading-4">
                    Show this QR code to the ranger at the trailhead before
                    starting your travel.
                  </p>
                </div>

                <div className="bg-parchment-100 border border-bark-100 rounded-xl p-4 mb-5 flex flex-col gap-3">
                  <div className="flex flex-row items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-parchment-200 flex items-center justify-center mt-0.5">
                      <Calendar size={13} className="text-bark-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Entry
                      </p>
                      <p className="text-sm text-bark-900 font-semibold">
                        {new Date(
                          registration.registration.planned_entry,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-parchment-200 flex items-center justify-center mt-0.5">
                      <Clock size={13} className="text-bark-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Exit
                      </p>
                      <p className="text-sm text-bark-900 font-semibold">
                        {new Date(
                          registration.registration.planned_exit,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-parchment-200 flex items-center justify-center mt-0.5">
                      <User size={13} className="text-bark-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Age
                      </p>
                      <p className="text-sm text-bark-900 font-semibold">
                        {registration.registration.age ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-parchment-200 flex items-center justify-center mt-0.5">
                      <ShieldCheck size={13} className="text-bark-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Citizenship
                      </p>
                      <p className="text-sm text-bark-900 font-semibold">
                        {registration.registration.citizen ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-parchment-200 flex items-center justify-center mt-0.5">
                      <MapPin size={13} className="text-bark-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Place
                      </p>
                      <p className="text-sm text-bark-900 font-semibold">
                        {registration.registration.place ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-parchment-200 flex items-center justify-center mt-0.5">
                      <Users size={13} className="text-bark-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-bark-500 font-bold uppercase tracking-[0.5px]">
                        Pax
                      </p>
                      <p className="text-sm text-bark-900 font-semibold">
                        {registration.registration.pax} member(s)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartTrek}
                  disabled={startingTrek}
                  className="w-full rounded-xl overflow-hidden disabled:opacity-60"
                  style={{ boxShadow: `0 6px 14px #36664459` }}
                >
                  <div
                    className="flex flex-row items-center justify-center gap-2 py-4"
                    style={{
                      background: "linear-gradient(90deg, #366644, #457a53)",
                    }}
                  >
                    {startingTrek ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Navigation size={18} color="white" />
                        <span className="text-white text-base font-extrabold tracking-wide">
                          Begin Travel
                        </span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TabLayout>
  );
}

export default function TrekStart() {
  return (
    <Suspense
      fallback={
        <TabLayout>
          <div className="min-h-screen bg-topo flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
          </div>
        </TabLayout>
      }
    >
      <TrekStartContent />
    </Suspense>
  );
}