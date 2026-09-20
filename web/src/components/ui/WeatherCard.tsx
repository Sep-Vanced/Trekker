"use client";

import {
    AlertTriangle,
    Bell,
    CheckCircle,
    ChevronRight,
    Droplets,
    MapPin,
    RefreshCw,
    Thermometer,
    Wind,
    XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type LiveWeather = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  status: "Safe" | "Caution" | "Danger";
  alerts: string[];
  locationName?: string;
  updatedAt?: Date;
  latitude?: number;
  longitude?: number;
};

const STATUS: Record<
  string,
  {
    strip: string;
    cardBg: string;
    border: string;
    iconColor: string;
    label: string;
  }
> = {
  Safe: {
    strip: "bg-green-500",
    cardBg: "bg-green-50",
    border: "border-green-200",
    iconColor: "#16a34a",
    label: "Safe to Hike",
  },
  Caution: {
    strip: "bg-amber-500",
    cardBg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "#d97706",
    label: "Proceed with Caution",
  },
  Danger: {
    strip: "bg-red-500",
    cardBg: "bg-red-50",
    border: "border-red-200",
    iconColor: "#dc2626",
    label: "Do Not Hike",
  },
};

export function WeatherCard({
  weather,
  loading,
  error,
  onPress,
  onRefresh,
}: {
  weather: LiveWeather | null;
  loading?: boolean;
  error?: string | null;
  onPress?: () => void;
  onRefresh?: () => void;
}) {
  const router = useRouter();

  if (loading && !weather) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-forest-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-xs">
          Getting weather for your location…
        </p>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 flex flex-col items-center gap-3">
        <XCircle size={28} color="#dc2626" />
        <p className="text-red-600 text-sm font-semibold text-center">
          {error}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex flex-row items-center gap-1.5 bg-red-100 px-4 py-2 rounded-full"
          >
            <RefreshCw size={12} color="#dc2626" />
            <span className="text-red-600 text-xs font-bold">Retry</span>
          </button>
        )}
      </div>
    );
  }

  if (!weather) return null;

  const cfg = STATUS[weather.status] ?? STATUS.Caution;

  return (
    <button
      onClick={onPress ?? (() => router.push("/weather-detail"))}
      className={`w-full text-left rounded-2xl border overflow-hidden ${cfg.cardBg} ${cfg.border}`}
    >
      <div
        className={`${cfg.strip} flex flex-row items-center justify-between px-4 py-2.5`}
      >
        <div className="flex flex-row items-center gap-1.5">
          {weather.status === "Safe" && <CheckCircle size={13} color="#fff" />}
          {weather.status === "Caution" && (
            <AlertTriangle size={13} color="#fff" />
          )}
          {weather.status === "Danger" && <XCircle size={13} color="#fff" />}
          <span className="text-white text-xs font-bold tracking-wide">
            {cfg.label}
          </span>
        </div>
        <div className="flex flex-row items-center gap-2">
          {onRefresh && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              className="cursor-pointer"
            >
              <RefreshCw size={12} color="rgba(255,255,255,0.8)" />
            </span>
          )}
          <span className="flex flex-row items-center gap-1">
            <span className="text-white/75 text-xs">Details</span>
            <ChevronRight size={12} color="rgba(255,255,255,0.75)" />
          </span>
        </div>
      </div>

      <div className="px-4 pt-3.5 pb-3">
        {weather.locationName && (
          <div className="flex flex-row items-center justify-between mb-2.5">
            <div className="flex flex-row items-center gap-1 flex-1">
              <MapPin size={11} color={cfg.iconColor} />
              <span className="text-gray-500 text-[11px] font-semibold flex-1 truncate">
                {weather.locationName}
              </span>
            </div>
            {weather.updatedAt && (
              <span className="text-gray-400 text-[10px] ml-2">
                Updated{" "}
                {weather.updatedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-row items-start justify-between mb-3">
          <div className="flex-1 pr-3">
            <p className="text-gray-800 text-base font-bold leading-5">
              {weather.condition}
            </p>
          </div>
          <span className="text-4xl">{weather.icon}</span>
        </div>

        <div className="flex flex-row gap-2 mb-3 flex-wrap">
          <span className="flex flex-row items-center gap-1 bg-white/70 rounded-full px-2.5 py-1">
            <Thermometer size={11} color={cfg.iconColor} />
            <span className="text-gray-600 text-xs font-semibold">
              {weather.temperature}°C
            </span>
          </span>
          <span className="flex flex-row items-center gap-1 bg-white/70 rounded-full px-2.5 py-1">
            <Droplets size={11} color={cfg.iconColor} />
            <span className="text-gray-600 text-xs font-semibold">
              {weather.humidity}%
            </span>
          </span>
          <span className="flex flex-row items-center gap-1 bg-white/70 rounded-full px-2.5 py-1">
            <Wind size={11} color={cfg.iconColor} />
            <span className="text-gray-600 text-xs font-semibold">
              {weather.windSpeed}km/h
            </span>
          </span>
        </div>

        {weather.alerts.length > 0 && (
          <div className="rounded-xl p-3 border bg-white/70">
            <div className="flex flex-row items-center gap-1.5 mb-1.5">
              <Bell size={11} color={cfg.iconColor} />
              <span className="text-gray-600 text-xs font-semibold">
                Active Alerts
              </span>
            </div>
            {weather.alerts.slice(0, 2).map((a, i) => (
              <div key={i} className="flex flex-row items-start gap-1.5 mb-0.5">
                <span className="text-gray-400 text-xs leading-4 mt-0.5">
                  •
                </span>
                <span className="text-gray-600 text-xs leading-4 flex-1">
                  {a}
                </span>
              </div>
            ))}
            {weather.alerts.length > 2 && (
              <span className="text-gray-400 text-xs mt-1">
                +{weather.alerts.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
