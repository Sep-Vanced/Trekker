import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useLocationWeather } from "@/hooks/useLocationWeather";
import {
  ChevronLeft,
  Droplets,
  Wind,
  CloudRain,
  Shield,
  Bell,
  BellOff,
  ClipboardList,
  Sparkles,
  Bot,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Thermometer,
  MapPin,
  RefreshCw,
  Thermometer as ThermometerIcon,
} from "lucide-react-native";

// ── Per-status config ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Safe: {
    headerBg:    "bg-green-600",
    badgeBg:     "bg-green-100",
    badgeText:   "text-green-700",
    alertBg:     "bg-green-50",
    alertBorder: "border-green-200",
    alertText:   "text-green-800",
    alertDot:    "#16a34a",
    Icon:         CheckCircle,
    iconColor:   "#16a34a",
    label:       "Safe to Travel",
  },
  Caution: {
    headerBg:    "bg-amber-500",
    badgeBg:     "bg-amber-100",
    badgeText:   "text-amber-700",
    alertBg:     "bg-amber-50",
    alertBorder: "border-amber-200",
    alertText:   "text-amber-800",
    alertDot:    "#d97706",
    Icon:         AlertTriangle,
    iconColor:   "#d97706",
    label:       "Proceed with Caution",
  },
  Danger: {
    headerBg:    "bg-red-600",
    badgeBg:     "bg-red-100",
    badgeText:   "text-red-700",
    alertBg:     "bg-red-50",
    alertBorder: "border-red-200",
    alertText:   "text-red-800",
    alertDot:    "#dc2626",
    Icon:         XCircle,
    iconColor:   "#dc2626",
    label:       "Do Not Travel",
  },
};

// ── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center gap-3">
      <ActivityIndicator size="large" color="#15803d" />
      <Text className="text-slate-400 text-sm">
        Getting weather for your location…
      </Text>
    </SafeAreaView>
  );
}

// ── Error screen ─────────────────────────────────────────────────────────────
function ErrorScreen({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-8 gap-4">
      <XCircle size={48} color="#dc2626" />
      <Text className="text-slate-700 font-bold text-lg text-center">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="flex-row items-center gap-2 bg-forest-700 px-6 py-3 rounded-2xl"
      >
        <RefreshCw size={14} color="white" />
        <Text className="text-white font-bold">Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onBack}>
        <Text className="text-slate-400 text-sm">Go back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function WeatherDetail() {
  const router = useRouter();
  const { weather, loading, error, refresh } = useLocationWeather();

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // ── Guard: loading ────────────────────────────────────────────────────────
  if (loading && !weather) return <LoadingSkeleton />;

  // ── Guard: error ──────────────────────────────────────────────────────────
  if ((error && !weather) || !weather) {
    return (
      <ErrorScreen
        message={error ?? "Could not load weather data."}
        onRetry={refresh}
        onBack={() => router.back()}
      />
    );
  }

  const cfg = STATUS_CONFIG[weather.status] ?? STATUS_CONFIG.Caution;
  const { Icon } = cfg;

  // ── AI advisory ────────────────────────────────────────────────────────────
  const fetchAIAdvice = async () => {
    setAiLoading(true);
    setAiAdvice(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a traveling safety advisor for Mapanuepe Lake in San Marcelino, Zambales, Philippines.

Current weather at the traveler's live location (${weather.locationName}):
- Condition: ${weather.condition}
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Wind speed: ${weather.windSpeed} km/h
- Status: ${weather.status}
- Alerts: ${weather.alerts.length > 0 ? weather.alerts.join("; ") : "None"}
- Coordinates: ${weather.latitude.toFixed(4)}°N, ${weather.longitude.toFixed(4)}°E

Give travelers a brief, practical weather advisory (4-5 sentences). Mention: best time to travel today, what to bring, and any specific hazards to watch for. Speak like a friendly, experienced local guide. Keep it conversational and actionable.`,
            },
          ],
        }),
      });
      const data = await response.json();
      setAiAdvice(data.content?.[0]?.text ?? "Unable to generate advice.");
    } catch {
      setAiAdvice(
        weather.status === "Safe"
          ? "Great day to travel! Weather is clear and conditions are ideal. Bring sunscreen and enough water — it can get hot by midday. All routes are accessible, so you can head to any camp you'd like."
          : weather.status === "Caution"
          ? "Traveling is possible today but stay alert to changing conditions. Start early if possible, bring a rain poncho, and be extra careful at river crossings."
          : "Conditions are dangerous right now. Please stay safe and wait for conditions to improve before attempting any route."
      );
    }
    setAiLoading(false);
  };

  // Stat grid
  const stats = [
    { Icon: Thermometer, label: "Temperature", value: `${weather.temperature}°C` },
    { Icon: Droplets,    label: "Humidity",    value: `${weather.humidity}%`      },
    { Icon: Wind,        label: "Wind Speed",  value: `${weather.windSpeed} km/h` },
    {
      Icon: MapPin,
      label: "Coordinates",
      value: `${weather.latitude.toFixed(3)}°N`,
    },
  ];

  const formatUpdated = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
        <View className={`px-5 pt-4 pb-10  ${cfg.headerBg}`}>
          {/* Top row: back + refresh */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color="rgba(255,255,255,0.8)" strokeWidth={2.5} />
              <Text className="text-white font-semibold text-sm ml-0.5">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={refresh}
              disabled={loading}
              className="flex-row items-center bg-white/20 px-3 py-2 rounded-full"
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" />
              ) : (
                <RefreshCw size={13} color="rgba(255,255,255,0.9)" />
              )}
              <Text className="text-white/90 text-xs font-semibold ml-1.5">Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Location name */}
          <View className="flex-row items-center gap-1.5 mb-3">
            <MapPin size={13} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
            <Text className="text-white/70 text-xs font-semibold">
              {weather.locationName}
            </Text>
          </View>

          {/* Temperature + emoji */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-white text-5xl font-bold tracking-tight">
                {weather.temperature}°C
              </Text>
              <Text className="text-white/90 text-base mt-1 font-medium">
                {weather.condition}
              </Text>
              <Text className="text-white/55 text-xs mt-0.5">
                Updated: {formatUpdated(weather.updatedAt)}
              </Text>
            </View>
            <Text className="text-6xl">{weather.icon}</Text>
          </View>

          {/* Status badge */}
          <View className="flex-row items-center bg-white/20 self-start px-4 py-2 rounded-full">
            <Icon size={14} color="#fff" strokeWidth={2.5} />
            <Text className="text-white text-xs font-bold uppercase tracking-wider ml-2">
              {cfg.label}
            </Text>
          </View>
        </View>

        <View className="px-5 pt-5">

          {/* ── STATS GRID ──────────────────────────────────────────────────── */}
          <View className="flex-row gap-3 mb-3">
            {stats.slice(0, 2).map((s) => (
              <View
                key={s.label}
                className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center"
                style={{ elevation: 2 }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: cfg.iconColor + "18" }}
                >
                  <s.Icon size={18} color={cfg.iconColor} strokeWidth={2} />
                </View>
                <Text className="text-gray-900 text-lg font-bold">{s.value}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{s.label}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row gap-3 mb-5">
            {stats.slice(2, 4).map((s) => (
              <View
                key={s.label}
                className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center"
                style={{ elevation: 2 }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                  style={{ backgroundColor: cfg.iconColor + "18" }}
                >
                  <s.Icon size={18} color={cfg.iconColor} strokeWidth={2} />
                </View>
                <Text className="text-gray-900 text-lg font-bold">{s.value}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── ACTIVE ALERTS ────────────────────────────────────────────────── */}
          <View className="flex-row items-center gap-2 mb-3">
            {weather.alerts.length > 0
              ? <Bell size={14} color="#374151" strokeWidth={2} />
              : <BellOff size={14} color="#9ca3af" strokeWidth={2} />
            }
            <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest">
              Active Alerts
            </Text>
            <View className="ml-auto bg-gray-100 rounded-full px-2.5 py-0.5">
              <Text className="text-gray-500 text-xs font-bold">
                {weather.alerts.length}
              </Text>
            </View>
          </View>

          {weather.alerts.length > 0 ? (
            <View
              className={`rounded-2xl overflow-hidden border mb-5 ${cfg.alertBorder}`}
            >
              {weather.alerts.map((alert, i) => (
                <View
                  key={i}
                  className={`flex-row items-start px-4 py-3.5 ${cfg.alertBg} ${
                    i < weather.alerts.length - 1
                      ? `border-b ${cfg.alertBorder}`
                      : ""
                  }`}
                >
                  <View
                    className="w-1.5 h-1.5 rounded-full mt-1.5 mr-3 shrink-0"
                    style={{ backgroundColor: cfg.alertDot }}
                  />
                  <Text className={`text-sm flex-1 leading-5 ${cfg.alertText}`}>
                    {alert}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5 mb-5 flex-row items-center">
              <CheckCircle size={14} color="#16a34a" strokeWidth={2} />
              <Text className="text-green-700 text-sm mx-2">
                No active weather alerts for your location
              </Text>
            </View>
          )}

          {/* ── AI ADVISORY BUTTON ───────────────────────────────────────────── */}
          {/* <TouchableOpacity
            className={`rounded-2xl py-4 flex-row items-center justify-center mb-4 ${
              aiLoading ? "bg-blue-400" : "bg-blue-600"
            }`}
            onPress={fetchAIAdvice}
            disabled={aiLoading}
            activeOpacity={0.8}
          >
            {aiLoading ? (
              <View>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white text-sm font-bold">
                  Generating advisory…
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Sparkles size={16} color="#fff" strokeWidth={2} />
                <Text className="text-white text-sm font-bold mx-2">
                  Get AI Trekking Advisory
                </Text>
              </View>
            )}
          </TouchableOpacity> */}

          {/* ── AI ADVICE RESULT ─────────────────────────────────────────────── */}
          {aiAdvice && (
            <View className="bg-white rounded-2xl border border-blue-100 mb-10 overflow-hidden"
              style={{ elevation: 2 }}
            >
              {/* Header strip */}
              <View className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-7 h-7 bg-blue-100 rounded-xl items-center justify-center">
                    <Bot size={14} color="#2563eb" strokeWidth={2} />
                  </View>
                  <Text className="text-blue-700 text-xs font-bold uppercase tracking-widest">
                    AI Weather Advisory
                  </Text>
                </View>
                {/* Location context badge */}
                <View className="flex-row items-center gap-1 bg-blue-100 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  <MapPin size={9} color="#2563eb" />
                  <Text className="text-blue-600 text-[10px] font-semibold">
                    {weather.locationName}
                  </Text>
                </View>
              </View>
              {/* Body */}
              <View className="px-4 py-4">
                <Text className="text-gray-800 text-sm leading-6">{aiAdvice}</Text>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}