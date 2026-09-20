"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { getPhaseConfig } from "@/components/ui/PhaseConfig";
import RouteMap from "@/components/ui/RouteMap";
import { LiveWeather, WeatherCard } from "@/components/ui/WeatherCard";
import { useAuth } from "@/hooks/useAuth";
import { Campsite } from "@/types/navigation-types";
import {
  AlertTriangle,
  Car,
  ChevronRight,
  MapPin,
  Mountain,
  Navigation,
  Phone,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const STARTING_POINT = {
  name: "Mapanuepe Lake Trailhead",
  municipality: "San Marcelino",
  province: "Zambales",
};

const QUICK_ACTIONS = [
  { label: "Select Route", icon: Navigation, bg: "var(--color-canopy-600)", href: "/routes" },
  { label: "Vehicle Check", icon: Car, bg: "var(--color-bark-700)", href: "/vehicle-check" },
  { label: "Emergency", icon: Phone, bg: "var(--color-rust-500)", href: "/emergency" },
];

/* ── Field-log stat readout, divided by dotted trail-lines ──────────── */
function StatReadout({
  icon: Icon,
  value,
  label,
  isLast,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-stretch">
      <div className="flex flex-col items-start px-4 py-1 first:pl-0">
        <Icon size={14} className="text-canopy-300 mb-1.5" />
        <span className="font-utility text-2xl lg:text-3xl font-bold text-white leading-none tabular-nums">
          {value}
        </span>
        <span className="text-canopy-300 text-[10px] font-bold uppercase tracking-widest mt-1">
          {label}
        </span>
      </div>
      {!isLast && <div className="trail-line opacity-40 mx-1" />}
    </div>
  );
}

/* ── Section header: icon chip + dotted map-legend leader line ──────── */
function SectionHeading({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-white" />
      </div>
      <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 whitespace-nowrap">
        {label}
      </span>
      <span className="flex-1 border-b border-dashed border-bark-300 translate-y-[1px]" />
    </div>
  );
}

/* ── Card shell: white body + canopy top stripe, trail-marker style ─── */
function Card({
  children,
  className = "",
  stripeColor = "var(--color-canopy-600)",
}: {
  children: React.ReactNode;
  className?: string;
  stripeColor?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden ${className}`}
    >
      <div className="h-[3px]" style={{ backgroundColor: stripeColor }} />
      <div className="p-5">{children}</div>
    </div>
  );
}

function HomeCampsiteCard({
  campsite,
  onPress,
}: {
  campsite: Campsite;
  onPress: () => void;
}) {
  const phase = getPhaseConfig(campsite.phase);
  return (
    <button
      onClick={onPress}
      className="w-full flex items-stretch bg-parchment-50 hover:bg-parchment-100 rounded-lg mb-2.5 border border-bark-100 text-left transition-colors overflow-hidden"
    >
      <div className="w-1.5" style={{ backgroundColor: phase.mapColor }} />
      <div className="flex flex-1 items-center py-3 px-3.5">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0"
          style={{ backgroundColor: `${phase.mapColor}18` }}
        >
          <Mountain size={18} color={phase.mapColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-bark-900 mb-0.5 truncate font-display">
            {campsite.name}
          </p>
          <span
            className="font-utility text-[10px] font-bold uppercase tracking-wider"
            style={{ color: phase.mapColor }}
          >
            {campsite.phase}
          </span>
        </div>
        <ChevronRight size={16} className="text-bark-300 shrink-0" />
      </div>
    </button>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [campsitesLoading, setCampsitesLoading] = useState(true);
  const [weather, setWeather] = useState<LiveWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",
    );
  }, []);

  useEffect(() => {
    const fetchCampsites = async () => {
      try {
        const res = await fetch("/api/navigation/campsite");
        const data = await res.json();
        setCampsites(Array.isArray(data) ? data.filter((c: Campsite) => c.is_active) : []);
      } catch {
        // silent
      } finally {
        setCampsitesLoading(false);
      }
    };
    fetchCampsites();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`,
            );
            const data = await res.json();
            const current = data.current;
            const code = current.weather_code;
            const conditionMap: Record<number, { condition: string; icon: string }> = {
              0: { condition: "Clear Sky", icon: "☀️" },
              1: { condition: "Mainly Clear", icon: "🌤️" },
              2: { condition: "Partly Cloudy", icon: "⛅" },
              3: { condition: "Overcast", icon: "☁️" },
              45: { condition: "Foggy", icon: "🌫️" },
              51: { condition: "Drizzle", icon: "🌦️" },
              61: { condition: "Rain", icon: "🌧️" },
              63: { condition: "Rain", icon: "🌧️" },
              65: { condition: "Heavy Rain", icon: "🌧️" },
              80: { condition: "Rain Showers", icon: "🌦️" },
              95: { condition: "Thunderstorm", icon: "⛈️" },
            };
            const cond = conditionMap[code] ?? { condition: "Unknown", icon: "🌡️" };
            const wind = Math.round(current.wind_speed_10m);
            const status: "Safe" | "Caution" | "Danger" =
              code >= 95 ? "Danger" : code >= 51 ? "Caution" : wind >= 35 ? "Caution" : "Safe";
            const alerts: string[] = [];
            if (code >= 95) alerts.push("Active thunderstorm — trekking not recommended.");
            if (code >= 51 && code <= 65) alerts.push("Rain expected — wear waterproof gear.");
            if (wind >= 35) alerts.push(`Strong winds at ${wind} km/h.`);

            setWeather({
              temperature: Math.round(current.temperature_2m),
              humidity: Math.round(current.relative_humidity_2m),
              windSpeed: wind,
              condition: cond.condition,
              icon: cond.icon,
              status,
              alerts,
              locationName: "Your Location",
              updatedAt: new Date(),
              latitude,
              longitude,
            });
          });
        }
      } catch {
        // silent
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const firstName = user?.username?.split(" ")[0] ?? "Traveler";

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ──────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-utility text-rust-400 text-[11px] font-bold tracking-[0.25em] uppercase">
                {greeting}
              </p>
              <h1 className="text-white text-3xl lg:text-5xl font-display font-bold mt-1 leading-none">
                {firstName}
              </h1>
              <div className="flex items-center gap-1.5 mt-3">
                <MapPin size={14} className="text-canopy-300" />
                <span className="text-canopy-200 text-sm">
                  {weather?.locationName ?? STARTING_POINT.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 border border-white/10">
                <MapPin size={14} className="text-canopy-200" />
                <span className="font-utility text-white text-xs tracking-wide">
                  {weather
                    ? `${weather.latitude?.toFixed(4)}°N, ${weather.longitude?.toFixed(4)}°E`
                    : `${STARTING_POINT.municipality}, ${STARTING_POINT.province}`}
                </span>
              </div>
              <Link
                href="/emergency"
                className="flex items-center gap-2 bg-rust-500 hover:bg-rust-600 px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-rust-600/30"
              >
                <AlertTriangle size={16} className="text-white" />
                <span className="text-white text-sm font-bold tracking-wide">SOS</span>
              </Link>
            </div>
          </div>

          {/* Field-log stats */}
          <div className="flex flex-row mt-7 pt-6 border-t border-white/10 max-w-2xl">
            <StatReadout icon={Navigation} value="35" label="Routes" />
            <StatReadout
              icon={Mountain}
              value={campsitesLoading ? "…" : String(campsites.length)}
              label="Camps"
            />
            <StatReadout icon={MapPin} value="—" label="Tracked" />
            <StatReadout icon={AlertTriangle} value="—" label="Rating" isLast />
          </div>
        </div>

        {/* ── Content Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route to Mapanuepe */}
            <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
              <div className="h-[3px] bg-canopy-600" />
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                    <Navigation size={15} className="text-white" />
                  </div>
                  <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 whitespace-nowrap">
                    Route to Mapanuepe
                  </span>
                  <span className="flex-1 border-b border-dashed border-bark-300 translate-y-[1px]" />
                </div>
              </div>
              <div className="h-[280px] w-full border-y border-bark-100">
                <RouteMap
                  destLat={14.9714}
                  destLng={120.165}
                  destName="Lake Mapanuepe"
                  destSubtitle="San Marcelino, Zambales"
                  userLat={weather?.latitude}
                  userLng={weather?.longitude}
                />
              </div>
              <div className="flex flex-row items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-rust-500 flex items-center justify-center">
                    <Mountain size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-bark-900 text-[13px] font-bold font-display">Lake Mapanuepe</p>
                    <p className="text-bark-500 text-[11px]">San Marcelino, Zambales</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="bg-parchment-100 rounded-lg px-3 py-2 text-center">
                    <span className="font-utility text-bark-900 font-bold text-sm block">— km</span>
                    <span className="text-bark-500 text-[9px] uppercase tracking-wider">Distance</span>
                  </div>
                  <div className="bg-parchment-100 rounded-lg px-3 py-2 text-center">
                    <span className="font-utility text-bark-900 font-bold text-sm block">—</span>
                    <span className="text-bark-500 text-[9px] uppercase tracking-wider">Drive time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather */}
            <Card stripeColor="var(--color-canopy-600)">
              <SectionHeading icon={MapPin} label="Weather at Your Location" />
              <WeatherCard
                weather={weather}
                loading={weatherLoading}
                onPress={() => (window.location.href = "/weather-detail")}
              />
            </Card>

            {/* Quick Actions */}
            <Card stripeColor="var(--color-rust-500)">
              <SectionHeading icon={Navigation} label="Quick Actions" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-4 hover:brightness-110 transition-all"
                    style={{ backgroundColor: action.bg }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                      <action.icon size={19} className="text-white" />
                    </div>
                    <span className="text-white text-sm font-bold">{action.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column (1/3) - Camp Destinations */}
          <div className="space-y-6">
            <Card stripeColor="var(--color-canopy-600)">
              <SectionHeading icon={Mountain} label="Camp Destinations" />

              {campsitesLoading && (
                <div className="flex flex-col items-center py-10 gap-2">
                  <div className="w-5 h-5 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
                  <p className="text-bark-500 text-xs">Loading campsites…</p>
                </div>
              )}
              {!campsitesLoading && campsites.length === 0 && (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Mountain size={28} className="text-bark-300" />
                  <p className="text-bark-500 text-sm">No campsites available</p>
                </div>
              )}
              {!campsitesLoading &&
                campsites.map((campsite) => (
                  <HomeCampsiteCard
                    key={campsite.id}
                    campsite={campsite}
                    onPress={() =>
                      (window.location.href = `/campsite-routes?campsiteId=${campsite.id}&campsiteName=${encodeURIComponent(campsite.name)}&campsitePhase=${encodeURIComponent(campsite.phase)}`)
                    }
                  />
                ))}
            </Card>
          </div>
        </div>
      </div>
    </TabLayout>
  );
}