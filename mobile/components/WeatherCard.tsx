import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Thermometer,
  Droplets,
  Wind,
  Bell,
  ChevronRight,
  MapPin,
  RefreshCw,
} from "lucide-react-native";
import { LiveWeather } from "@/hooks/useLocationWeather";

// ─── Accept live weather OR fallback static shape ─────────────────────────────
export type WeatherCardData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  status: "Safe" | "Caution" | "Danger";
  alerts: string[];
  locationName?: string;
  updatedAt?: Date;
};

type Props = {
  weather: WeatherCardData | LiveWeather | null;
  loading?: boolean;
  error?: string | null;
  onPress?: () => void;
  onRefresh?: () => void;
};

const STATUS = {
  Safe: {
    strip:       "bg-green-500",
    cardBg:      "bg-green-50",
    border:      "border-green-200",
    alertBg:     "bg-white/70",
    alertBorder: "border-green-100",
    Icon:         CheckCircle,
    iconColor:   "#16a34a",
    label:       "Safe to Hike",
  },
  Caution: {
    strip:       "bg-amber-500",
    cardBg:      "bg-amber-50",
    border:      "border-amber-200",
    alertBg:     "bg-white/70",
    alertBorder: "border-amber-100",
    Icon:         AlertTriangle,
    iconColor:   "#d97706",
    label:       "Proceed with Caution",
  },
  Danger: {
    strip:       "bg-red-500",
    cardBg:      "bg-red-50",
    border:      "border-red-200",
    alertBg:     "bg-white/70",
    alertBorder: "border-red-100",
    Icon:         XCircle,
    iconColor:   "#dc2626",
    label:       "Do Not Hike",
  },
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WeatherCard({ weather, loading, error, onPress, onRefresh }: Props) {
  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading && !weather) {
    return (
      <View className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 items-center gap-3">
        <ActivityIndicator size="small" color="#15803d" />
        <Text className="text-slate-400 text-xs">
          Getting weather for your location…
        </Text>
      </View>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && !weather) {
    return (
      <View className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 items-center gap-3">
        <XCircle size={28} color="#dc2626" />
        <Text className="text-red-600 text-sm font-semibold text-center">
          {error}
        </Text>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            className="flex-row items-center gap-1.5 bg-red-100 px-4 py-2 rounded-full"
          >
            <RefreshCw size={12} color="#dc2626" />
            <Text className="text-red-600 text-xs font-bold">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!weather) return null;

  const cfg = STATUS[weather.status] ?? STATUS.Caution;
  const { Icon } = cfg;
  const locationName = (weather as LiveWeather).locationName;
  const updatedAt = (weather as LiveWeather).updatedAt;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`rounded-2xl border overflow-hidden ${cfg.cardBg} ${cfg.border}`}
    >
      {/* ── Status strip ─────────────────────────────────── */}
      <View className={`${cfg.strip} flex-row items-center justify-between px-4 py-2.5`}>
        <View className="flex-row items-center gap-1.5">
          <Icon size={13} color="#fff" strokeWidth={2.5} />
          <Text className="text-white text-xs font-bold tracking-wide">{cfg.label}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {/* Refresh button */}
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
              ) : (
                <RefreshCw size={12} color="rgba(255,255,255,0.8)" />
              )}
            </TouchableOpacity>
          )}
          <View className="flex-row items-center gap-1">
            <Text className="text-white/75 text-xs">Details</Text>
            <ChevronRight size={12} color="rgba(255,255,255,0.75)" strokeWidth={2.5} />
          </View>
        </View>
      </View>

      {/* ── Body ─────────────────────────────────────────── */}
      <View className="px-4 pt-3.5 pb-3">

        {/* Location + last updated */}
        {(locationName || updatedAt) && (
          <View className="flex-row items-center justify-between mb-2.5">
            {locationName && (
              <View className="flex-row items-center gap-1 flex-1">
                <MapPin size={11} color={cfg.iconColor} strokeWidth={2.5} />
                <Text
                  className="text-gray-500 text-[11px] font-semibold flex-1"
                  numberOfLines={1}
                >
                  {locationName}
                </Text>
              </View>
            )}
            {updatedAt && (
              <Text className="text-gray-400 text-[10px] ml-2">
                Updated {formatTime(updatedAt)}
              </Text>
            )}
          </View>
        )}

        {/* Condition + emoji */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-gray-800 text-base font-bold leading-5">
              {weather.condition}
            </Text>
          </View>
          <Text className="text-4xl">{weather.icon}</Text>
        </View>

        {/* Stat pills */}
        <View className="flex-row gap-2 mb-3">
          {[
            { Icon: Thermometer, value: `${weather.temperature}°C` },
            { Icon: Droplets,    value: `${weather.humidity}%`     },
            { Icon: Wind,        value: `${weather.windSpeed}km/h` },
          ].map((s, i) => (
            <View
              key={i}
              className="flex-row items-center gap-1 bg-white/70 rounded-full px-2.5 py-1"
            >
              <s.Icon size={11} color={cfg.iconColor} strokeWidth={2.5} />
              <Text className="text-gray-600 text-xs font-semibold">{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Active alerts */}
        {weather.alerts.length > 0 && (
          <View className={`rounded-xl p-3 border ${cfg.alertBg} ${cfg.alertBorder}`}>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Bell size={11} color={cfg.iconColor} strokeWidth={2.5} />
              <Text className="text-gray-600 text-xs font-semibold">Active Alerts</Text>
            </View>
            {weather.alerts.slice(0, 2).map((a, i) => (
              <View key={i} className="flex-row items-start gap-1.5 mb-0.5">
                <Text className="text-gray-400 text-xs leading-4 mt-0.5">•</Text>
                <Text className="text-gray-600 text-xs leading-4 flex-1">{a}</Text>
              </View>
            ))}
            {weather.alerts.length > 2 && (
              <Text className="text-gray-400 text-xs mt-1">
                +{weather.alerts.length - 2} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}