"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  AlarmClockOff,
  AlertTriangle,
  Phone,
  PhoneCall,
  ShieldAlert,
  Siren,
  User,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

const EMERGENCY_CONTACTS = [
  {
    name: "San Marcelino MDRRMO",
    role: "Municipal Disaster Risk Reduction",
    number: "0908-888-3776",
  },
  {
    name: "San Marcelino Health Office",
    role: "Health Emergencies",
    number: "0916-270-7178",
  },
  {
    name: "PNP San Marcelino",
    role: "Police Emergencies",
    number: "0998-598-5506",
  },
  { name: "BFP San Marcelino", role: "Fire & Rescue", number: "0951-118-6269" },
];

const SAFETY_TIPS = [
  "Stay calm and stay in one place.",
  "Send your SOS and GPS coordinates immediately.",
  "Do not attempt to navigate dangerous terrain alone.",
  "Wait for rescue teams — they will reach you.",
];

function SectionHeading({
  icon: Icon,
  label,
  accent = "var(--color-danger-500)",
  iconBg = "#f5ded0",
  iconColor = "#a3291f",
}: {
  icon: LucideIcon;
  label: string;
  accent?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={15} color={iconColor} />
      </div>
      <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 whitespace-nowrap">
        {label}
      </span>
      <span
        className="flex-1 border-b border-dashed translate-y-[1px]"
        style={{ borderColor: accent }}
      />
    </div>
  );
}

function ContactCard({
  name,
  role,
  number,
  tone = "danger",
  onPress,
}: {
  name: string;
  role: string;
  number: string;
  tone?: "danger" | "safe";
  onPress: () => void;
}) {
  const iconBg = tone === "danger" ? "bg-rust-100" : "bg-canopy-100";
  const iconColor =
    tone === "danger" ? "var(--color-danger-500)" : "var(--color-canopy-600)";
  const badge = tone === "danger" ? "bg-rust-500" : "bg-canopy-600";
  const stripe =
    tone === "danger" ? "var(--color-danger-500)" : "var(--color-canopy-600)";

  return (
    <button
      onClick={onPress}
      className="w-full bg-white rounded-xl overflow-hidden border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] hover:shadow-md transition-shadow text-left"
    >
      <div className="h-[3px]" style={{ backgroundColor: stripe }} />
      <div className="p-4 flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Phone size={18} color={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-bark-900 text-sm font-bold font-display truncate">
            {name}
          </p>
          <p className="text-bark-500 text-xs mt-0.5">{role}</p>
          <p
            className="font-mono text-xs font-semibold mt-0.5"
            style={{ color: iconColor }}
          >
            {number}
          </p>
        </div>
        <div
          className={`${badge} rounded-lg px-3.5 py-2 flex items-center shrink-0`}
        >
          <Phone size={12} className="text-white" />
          <span className="text-white text-xs font-bold ml-1.5">Call</span>
        </div>
      </div>
    </button>
  );
}

export default function Emergency() {
  const { user, refreshUserIn } = useAuth();
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  const handleCall = async (number: string, name: string) => {
    const result = await Swal.fire({
      title: `Call ${name}?`,
      text: number,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Call Now",
      confirmButtonColor: "#b5511f",
      cancelButtonColor: "#6f6350",
      background: "#fbfaf3",
      showCloseButton: true,
    });
    if (result.isConfirmed) {
      window.open(`tel:${number}`, "_self");
    }
  };

  const handleSOS = async () => {
    if (sosSent) {
      setSosSent(false);
      return;
    }

    // Show loading while acquiring GPS fix
    setSosLoading(true);
    Swal.fire({
      title: "Acquiring GPS…",
      text: "Please allow location access to share your exact coordinates.",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: "#fbfaf3",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const confirmSend = async (title: string, text: string) => {
      const result = await Swal.fire({
        title,
        text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Send SOS",
        confirmButtonColor: "#a3291f",
        cancelButtonColor: "#6f6350",
        background: "#fbfaf3",
        showCloseButton: true,
      });
      return result.isConfirmed;
    };

        const sendSosToBackend = async (
      lat: number | null,
      lng: number | null,
      isRetry = false,
    ): Promise<boolean> => {
      try {
        const res = await fetch("/api/emergency/sos", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: lat,
            longitude: lng,
            message: "SOS activated from Emergency Center",
          }),
        });

        if (res.status === 401 && !isRetry) {
          // Access token likely expired — try a silent refresh, then retry once
          const refreshed = await refreshUserIn();
          if (refreshed) {
            return sendSosToBackend(lat, lng, true);
          }
          return false;
        }

        return res.ok;
      } catch {
        return false;
      }
    };

    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 15000,
              maximumAge: 0,
            });
          },
        );
        const { latitude, longitude } = pos.coords;
        Swal.close();
        const confirmed = await confirmSend(
          "Send SOS with your location?",
          `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
        );
        if (confirmed) {
          const sent = await sendSosToBackend(latitude, longitude);
          setSosSent(true);
          Swal.fire({
            title: sent ? "SOS Sent!" : "SOS Sent (Offline)",
            text: sent
              ? "Your GPS coordinates have been shared with the rescue team."
              : "Your SOS was recorded locally. Rangers will be notified when you're back online.",
            icon: "success",
            confirmButtonColor: "#366644",
            background: "#fbfaf3",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      } else {
        Swal.close();
        const confirmed = await confirmSend(
          "Send SOS signal?",
          "GPS is not available on this device. Your SOS will be sent without coordinates.",
        );
        if (confirmed) {
          const sent = await sendSosToBackend(null, null);
          setSosSent(true);
          Swal.fire({
            title: sent ? "SOS Sent!" : "SOS Sent (Offline)",
            text: sent
              ? "Your SOS signal has been transmitted."
              : "Your SOS was recorded locally. Rangers will be notified when you're back online.",
            icon: "success",
            confirmButtonColor: "#366644",
            background: "#fbfaf3",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      }
    } catch {
      // Geolocation failed or timed out — offer to send without GPS
      Swal.close();
      const confirmed = await confirmSend(
        "Send SOS without GPS?",
        "We couldn't get your location. Your SOS will be sent without coordinates.",
      );
      if (confirmed) {
        const sent = await sendSosToBackend(null, null);
        setSosSent(true);
        Swal.fire({
          title: sent ? "SOS Sent!" : "SOS Sent (Offline)",
          text: sent
            ? "Your SOS signal has been transmitted."
            : "Your SOS was recorded locally. Rangers will be notified when you're back online.",
          icon: "success",
          confirmButtonColor: "#366644",
          background: "#fbfaf3",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Emergency Hero ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shadow-xl mb-6 bg-gradient-to-br from-[#7a1f17] via-[#8f2a1f] to-[#a3291f]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.10)_0,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.06)_0,transparent_45%)]" />

          <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <p className="font-utility text-red-200 text-[11px] font-bold uppercase tracking-[0.25em]">
                Urgent Assistance
              </p>
              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Siren size={20} className="text-white" />
                </div>
                <h1 className="text-white text-3xl lg:text-4xl font-display font-bold leading-none">
                  Emergency Center
                </h1>
              </div>
              <p className="text-red-200 text-sm mt-3">
                SOS & Emergency Contacts — reach help instantly.
              </p>
            </div>

            <button
              onClick={handleSOS}
              disabled={sosLoading}
              className={`flex items-center gap-3 rounded-xl px-6 py-4 transition-all shadow-xl shrink-0 disabled:opacity-70 ${
                sosSent
                  ? "bg-canopy-500 ring-4 ring-canopy-400/30"
                  : "bg-white/95 hover:bg-white ring-4 ring-white/20"
              }`}
            >
              {sosLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-[#a3291f]/30 border-t-[#a3291f] rounded-full animate-spin" />
                  <div className="text-left">
                    <span className="block text-[#7a1f17] text-sm font-extrabold tracking-wide">
                      Acquiring GPS…
                    </span>
                    <span className="block text-[#9a4319] text-[11px] font-semibold">
                      Please wait
                    </span>
                  </div>
                </>
              ) : sosSent ? (
                <>
                  <ShieldAlert size={22} className="text-white" />
                  <div className="text-left">
                    <span className="block text-white text-sm font-extrabold tracking-wide">
                      SOS Sent
                    </span>
                    <span className="block text-canopy-100 text-[11px] font-semibold">
                      Tap to cancel
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle size={22} className="text-[#a3291f]" />
                  <div className="text-left">
                    <span className="block text-[#7a1f17] text-sm font-extrabold tracking-wide">
                      Activate SOS
                    </span>
                    <span className="block text-[#9a4319] text-[11px] font-semibold">
                      Share GPS location
                    </span>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Status strip */}
          <div className="relative flex items-center gap-3 mt-6 pt-5 border-t border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse" />
              <span className="text-red-100 text-[11px] font-bold uppercase tracking-wider">
                Hotline active 24/7
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-red-200 text-[11px]">Rescuers</span>
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-white/25 border-2 border-[#8a2a1f] flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">M</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/25 border-2 border-[#8a2a1f] flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">P</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/25 border-2 border-[#8a2a1f] flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">B</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Emergency Contacts ─────────────────────────────────────── */}
        <div className="mb-7">
          <SectionHeading icon={PhoneCall} label="Emergency Contacts" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {EMERGENCY_CONTACTS.map((contact) => (
              <ContactCard
                key={contact.name}
                name={contact.name}
                role={contact.role}
                number={contact.number}
                onPress={() => handleCall(contact.number, contact.name)}
              />
            ))}
          </div>
        </div>

        {/* ── Personal Emergency Contact ─────────────────────────────── */}
        {user?.emergency_contact_phone && (
          <div className="mb-7">
            <SectionHeading
              icon={User}
              label="Your Emergency Contact"
              accent="var(--color-canopy-600)"
              iconBg="#e2eee2"
              iconColor="#366644"
            />
            <button
              onClick={() =>
                handleCall(
                  user.emergency_contact_phone!,
                  user.emergency_contact_name || "Emergency Contact",
                )
              }
              className="w-full bg-white rounded-xl overflow-hidden border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] hover:shadow-md transition-shadow text-left"
            >
              <div className="h-[3px] bg-canopy-600" />
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-canopy-100 flex items-center justify-center shrink-0 border border-canopy-200">
                  <User size={18} color="#366644" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-bark-900 text-sm font-bold font-display truncate">
                      {user.emergency_contact_name}
                    </p>
                    <span className="bg-canopy-100 border border-canopy-200 px-2 py-0.5 rounded-full text-canopy-700 text-[10px] font-bold">
                      Personal
                    </span>
                  </div>
                  <p className="text-bark-500 text-xs">
                    Emergency contact on file
                  </p>
                  <p className="font-mono text-xs font-semibold text-canopy-600 mt-0.5">
                    {user.emergency_contact_phone}
                  </p>
                </div>
                <div className="bg-canopy-600 rounded-lg px-3.5 py-2 flex items-center shrink-0">
                  <Phone size={12} className="text-white" />
                  <span className="text-white text-xs font-bold ml-1.5">
                    Call
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Safety Reminder ────────────────────────────────────────── */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 mb-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlarmClockOff size={15} color="#b45309" />
            </div>
            <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-amber-900">
              Safety Reminder
            </span>
            <span className="flex-1 border-b border-dashed border-amber-300 translate-y-[1px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {SAFETY_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-px">
                  {i + 1}
                </span>
                <span className="text-amber-800 text-xs leading-5">
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabLayout>
  );
}