import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { getRoutesByCampsite } from "../../api/navigation";
import { getRouteWeather, refreshRouteWeather } from "../../api/weather";
import { TrekRoute } from "@/types/navigation-types";
import { RouteWeather } from "@/types/weather-types";

// ─── Types ────────────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Difficulty config ────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<
  string,
  {
    accent: string;
    accentAlpha: string;
    iconColor: string;
    icon: IoniconName;
    nwBg: string;
    nwText: string;
  }
> = {
  easy:     { accent: "#1f8645", accentAlpha: "#1f864518", iconColor: "#16a34a", icon: "walk",        nwBg: "bg-emerald-100", nwText: "text-emerald-800" },
  moderate: { accent: "#0369a1", accentAlpha: "#0369a118", iconColor: "#2563eb", icon: "trending-up", nwBg: "bg-sky-100",     nwText: "text-sky-800"     },
  hard:     { accent: "#c2410c", accentAlpha: "#c2410c18", iconColor: "#ea580c", icon: "flame",       nwBg: "bg-orange-100", nwText: "text-orange-800"  },
  expert:   { accent: "#b91c1c", accentAlpha: "#b91c1c18", iconColor: "#dc2626", icon: "skull",       nwBg: "bg-red-100",    nwText: "text-red-800"     },
};
const getDiffConfig = (difficulty: string) =>
  DIFFICULTY_CONFIG[difficulty.toLowerCase()] ?? DIFFICULTY_CONFIG.moderate;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { dotColor: string; nwBg: string; nwText: string }> = {
  open:    { dotColor: "#22c55e", nwBg: "bg-emerald-100", nwText: "text-emerald-800" },
  caution: { dotColor: "#f59e0b", nwBg: "bg-amber-100",   nwText: "text-amber-800"   },
  closed:  { dotColor: "#ef4444", nwBg: "bg-red-100",     nwText: "text-red-800"     },
};
const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.open;

// ─── Weather condition config ─────────────────────────────────────────────────
const WEATHER_CONDITION_CONFIG: Record<
  string,
  { icon: IoniconName; color: string; bg: string }
> = {
  clear:        { icon: "sunny",             color: "#f59e0b", bg: "#fef9c3" },
  sunny:        { icon: "sunny",             color: "#f59e0b", bg: "#fef9c3" },
  cloudy:       { icon: "cloudy",            color: "#64748b", bg: "#f1f5f9" },
  partly_cloudy:{ icon: "partly-sunny",      color: "#94a3b8", bg: "#f1f5f9" },
  overcast:     { icon: "cloudy",            color: "#475569", bg: "#e2e8f0" },
  rain:         { icon: "rainy",             color: "#2563eb", bg: "#dbeafe" },
  drizzle:      { icon: "rainy",             color: "#3b82f6", bg: "#dbeafe" },
  heavy_rain:   { icon: "thunderstorm",      color: "#1d4ed8", bg: "#dbeafe" },
  thunderstorm: { icon: "thunderstorm",      color: "#7c3aed", bg: "#ede9fe" },
  fog:          { icon: "cloudy-night",      color: "#94a3b8", bg: "#f1f5f9" },
  windy:        { icon: "flag",              color: "#0891b2", bg: "#cffafe" },
};
const getWeatherConditionConfig = (condition: string) =>
  WEATHER_CONDITION_CONFIG[condition.toLowerCase()] ??
  WEATHER_CONDITION_CONFIG.cloudy;

// ─── Shimmer hook ─────────────────────────────────────────────────────────────
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [anim]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  const opacity = useShimmer();
  return (
    <Animated.View style={{ opacity }} className="bg-white rounded-3xl mb-4 overflow-hidden">
      <View className="h-1 bg-slate-200 w-full" />
      <View className="p-4">
        <View className="flex-row items-start mb-3 gap-3">
          <View className="flex-1 gap-2">
            <View className="h-4 w-3/4 bg-slate-200 rounded-lg" />
            <View className="h-3 w-full bg-slate-100 rounded-md" />
            <View className="h-3 w-2/3 bg-slate-100 rounded-md" />
          </View>
          <View className="w-11 h-11 rounded-[14px] bg-slate-200" />
        </View>
        <View className="flex-row gap-2 mb-[10px]">
          <View className="h-6 w-20 rounded-full bg-slate-200" />
          <View className="h-6 w-16 rounded-full bg-slate-100" />
        </View>
        {/* Weather skeleton */}
        <View className="h-16 rounded-2xl bg-slate-100 mb-3" />
        <View className="flex-row gap-4 pb-3 border-b border-slate-50">
          <View className="h-3 w-14 bg-slate-100 rounded-md" />
          <View className="h-3 w-10 bg-slate-100 rounded-md" />
          <View className="h-3 w-12 bg-slate-100 rounded-md" />
        </View>
        <View className="h-3 w-1/2 bg-slate-100 rounded-md mt-3 mb-3" />
        <View className="h-12 rounded-2xl bg-slate-200" />
      </View>
    </Animated.View>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ icon, value }: { icon: IoniconName; value: string }) {
  return (
    <View className="flex-row items-center mr-2 justify-center">
      <Ionicons name={icon} size={12} color="#94a3b8" />
      <Text className="text-[11px] text-slate-500 font-medium ml-1">{value}</Text>
    </View>
  );
}

// ─── Weather badge ────────────────────────────────────────────────────────────
function WeatherBadge({
  weather,
  loading,
}: {
  weather: RouteWeather | null;
  loading: boolean;
}) {
  const shimmerOpacity = useShimmer();

  if (loading) {
    return (
      <Animated.View
        style={{ opacity: shimmerOpacity }}
        className="h-[70px] rounded-2xl bg-slate-100 mb-3"
      />
    );
  }

  if (!weather) return null;

  const { report, has_danger, alert_count } = weather;
  const condCfg = getWeatherConditionConfig(report.condition);
  const isSafe  = report.is_safe_to_trek;

  return (
    <View
      className="rounded-2xl mb-3 overflow-hidden"
      style={{
        backgroundColor: isSafe ? "#f0fdf4" : "#fff7ed",
        borderWidth: 1,
        borderColor: isSafe ? "#bbf7d0" : "#fed7aa",
      }}
    >
      <View className="flex-row items-center px-3 py-2.5 gap-3">

        {/* Condition icon */}
        <View
          className="w-10 h-10 rounded-[12px] items-center justify-center"
          style={{ backgroundColor: condCfg.bg }}
        >
          <Ionicons name={condCfg.icon} size={20} color={condCfg.color} />
        </View>

        {/* Weather stats */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            {/* Condition label */}
            <Text className="text-[12px] font-bold text-slate-700">
              {report.condition_display}
            </Text>
            {/* Safe/unsafe pill */}
            <View
              className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isSafe ? "#dcfce7" : "#ffedd5",
              }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSafe ? "#22c55e" : "#f97316" }}
              />
              <Text
                className="text-[10px] font-bold"
                style={{ color: isSafe ? "#15803d" : "#c2410c" }}
              >
                {isSafe ? "Safe to Travel" : "Use Caution"}
              </Text>
            </View>
          </View>

          {/* Metrics row */}
          <View className="flex-row items-center gap-3 flex-wrap">
            <View className="flex-row items-center gap-1">
              <Ionicons name="thermometer" size={11} color="#94a3b8" />
              <Text className="text-[11px] text-slate-500 font-medium">
                {report.temperature_c}°C
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="water" size={11} color="#94a3b8" />
              <Text className="text-[11px] text-slate-500 font-medium">
                {report.humidity_pct}%
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="flag" size={11} color="#94a3b8" />
              <Text className="text-[11px] text-slate-500 font-medium">
                {report.wind_speed_kph} kph
              </Text>
            </View>
            {parseFloat(report.rainfall_mm) > 0 && (
              <View className="flex-row items-center gap-1">
                <Ionicons name="rainy" size={11} color="#3b82f6" />
                <Text className="text-[11px] text-blue-500 font-medium">
                  {report.rainfall_mm}mm
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Alert indicator */}
        {has_danger || alert_count > 0 ? (
          <View className="items-center justify-center">
            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
              <Ionicons name="warning" size={15} color="#f97316" />
            </View>
            {alert_count > 0 && (
              <Text className="text-[9px] font-bold text-orange-500 mt-0.5">
                {alert_count} alert{alert_count > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        ) : (
          <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
            <Ionicons name="checkmark" size={15} color="#22c55e" />
          </View>
        )}
      </View>

      {/* Alerts strip — shown only if alerts exist */}
      {weather.alerts.length > 0 && (
        <View
          className="px-3 py-2 border-t"
          style={{ borderColor: "#fed7aa", backgroundColor: "#fff3e0" }}
        >
          {weather.alerts.map((alert, i) => (
            <View key={i} className="flex-row items-start gap-1.5">
              <Ionicons name="alert-circle" size={11} color="#f97316" style={{ marginTop: 1 }} />
              <Text className="text-[10px] text-orange-700 font-medium flex-1">{alert}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Route card ───────────────────────────────────────────────────────────────
function RouteCard({
  route,
  weather,
  weatherLoading,
  onPress,
}: {
  route: TrekRoute;
  weather: RouteWeather | null;
  weatherLoading: boolean;
  onPress: () => void;
}) {
  const diff   = getDiffConfig(route.difficulty);
  const status = getStatusConfig(route.status);
  const [refreshing, setRefreshing] = useState(false);

  const hours = parseFloat(route.estimated_hours);
  const timeLabel =
    hours < 1
      ? `${Math.round(hours * 60)} min`
      : hours === Math.floor(hours)
      ? `${hours}h`
      : `${hours}h`;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const handlePress = async () => {
    // Fire refresh in background — no need to await, navigation happens immediately
    refreshRouteWeather(route.id).catch(() => {});
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.88}
      className="bg-white rounded-lg mb-4 overflow-hidden"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      {/* Difficulty accent bar */}
      <View style={{ backgroundColor: diff.accent, height: 4 }} />

      <View className="p-4">
        {/* Top row */}
        <View className="flex-row items-start mb-[10px]">
          <View className="flex-1 pr-3">
            <Text className="text-[15px] font-bold text-slate-900 leading-snug">
              {route.name}
            </Text>
            <Text className="text-xs text-slate-400 mt-1 leading-[17px]" numberOfLines={2}>
              {route.description}
            </Text>
          </View>
          <View
            className="w-11 h-11 rounded-[14px] items-center justify-center"
            style={{ backgroundColor: diff.accentAlpha }}
          >
            <Ionicons name="trail-sign" size={20} color={diff.accent} />
          </View>
        </View>

        {/* Pills */}
        <View className="flex-row gap-2 mb-3">
          <View className={`flex-row items-center px-[10px] py-1 rounded-full ${diff.nwBg}`}>
            <Ionicons name={diff.icon} size={11} color={diff.iconColor} />
            <Text className={`text-[11px] font-bold ${diff.nwText} ml-1`}>
              {capitalize(route.difficulty)}
            </Text>
          </View>
          <View className={`flex-row items-center px-[10px] py-1 rounded-full ${status.nwBg}`}>
            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dotColor }} />
            <Text className={`text-[11px] font-bold ${status.nwText} ml-1`}>
              {capitalize(route.status)}
            </Text>
          </View>
        </View>

        {/* ── Weather badge ─────────────────────────────────────────── */}
        <WeatherBadge weather={weather} loading={weatherLoading} />

        {/* Stats row */}
        <View className="flex-row pb-2 items-center border-b border-slate-100">
          <StatChip icon="resize"      value={`${route.total_distance_km} km`} />
          <StatChip icon="time"        value={timeLabel} />
          <StatChip icon="trending-up" value={`+${route.elevation_gain_m}m`} />
        </View>

        {/* Start point */}
        <View className="flex-row items-center my-4">
          <Ionicons name="location" size={13} color="#94a3b8" />
          <Text className="text-xs text-slate-400 flex-1 ml-1" numberOfLines={1}>
            Start: {route.start_name}
          </Text>
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.82}
          className="flex-row items-center justify-center rounded-lg py-[13px]"
          style={{
            backgroundColor: diff.accent,
            shadowColor: diff.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Ionicons name="navigate" size={15} color="white" />
          <Text className="text-white text-sm font-bold tracking-wide mx-2">
            Check This Route
          </Text>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ campsiteName }: { campsiteName: string }) {
  return (
    <View className="items-center py-12">
      <View className="w-16 h-16 rounded-[20px] bg-slate-100 items-center justify-center mb-3">
        <Ionicons name="trail-sign-outline" size={30} color="#94a3b8" />
      </View>
      <Text className="text-[15px] font-bold text-slate-500">No routes available</Text>
      <Text className="text-xs text-slate-400 mt-1 text-center px-8">
        No travel routes found for {campsiteName}
      </Text>
    </View>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-row items-center gap-2.5 bg-red-50 border border-red-200 rounded-2xl p-[14px] mb-4">
      <Ionicons name="alert-circle" size={18} color="#dc2626" />
      <Text className="flex-1 text-[13px] text-red-700 font-medium">{message}</Text>
      <TouchableOpacity onPress={onRetry}>
        <Text className="text-xs text-red-600 font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CampsiteRoutes() {
  const router = useRouter();
  const { campsiteId, campsiteName, campsitePhase } = useLocalSearchParams<{
    campsiteId: string;
    campsiteName: string;
    campsitePhase: string;
  }>();

  const [routes,  setRoutes]  = useState<TrekRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Per-route weather state
  const [weatherMap,        setWeatherMap]        = useState<Record<number, RouteWeather>>({});
  const [weatherLoadingSet, setWeatherLoadingSet] = useState<Set<number>>(new Set());

  const decodedName  = campsiteName  ? decodeURIComponent(campsiteName)  : "Campsite";
  const decodedPhase = campsitePhase ? decodeURIComponent(campsitePhase) : "";

  // ── Fetch weather for a single route ───────────────────────────────────────
  const fetchWeatherForRoute = async (routeId: number) => {
    setWeatherLoadingSet((prev) => new Set(prev).add(routeId));
    try {
      const res = await getRouteWeather(routeId);
      setWeatherMap((prev) => ({ ...prev, [routeId]: res.data }));
    } catch {
      // Silently fail — weather is supplementary info
    } finally {
      setWeatherLoadingSet((prev) => {
        const next = new Set(prev);
        next.delete(routeId);
        return next;
      });
    }
  };

  // ── Fetch routes then load weather for all in parallel ─────────────────────
  const fetchRoutes = async () => {
    if (!campsiteId) return;
    try {
      setLoading(true);
      setError(null);
      const res    = await getRoutesByCampsite(Number(campsiteId));
      const active = res.data.filter((r) => r.is_active);
      setRoutes(active);
      // Fire all weather requests concurrently — don't wait
      active.forEach((r) => fetchWeatherForRoute(r.id));
    } catch {
      setError("Failed to load routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, [campsiteId]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

              {/* ── Header ──────────────────────────────────────────────────── */}
        <View
          className="bg-forest-900 px-3 pb-6"
          style={{
            shadowColor: "#0f5229",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <View className="flex items-start justify-between flex-row mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center rounded-2xl bg-white/20 px-3 py-1.5 self-start"
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              <Text className="text-[13px] font-semibold ml-2" style={{ color: "#FFFFFF" }}>
                All Campsites
              </Text>
            </TouchableOpacity>

          {decodedPhase ? (
            <View
              className="flex-row items-center self-start px-[10px] py-2.5 rounded-full bg-white/20"
            >
              <Ionicons name="layers" size={12} color="rgba(255,255,255,0.75)" />
              <Text className="text-[12px] font-semibold text-white/90 ml-1">{decodedPhase}</Text>
            </View>
          ) : null}
          </View>

          <Text className="text-white/60 text-[11px] font-semibold tracking-[1.2px] uppercase">
            Tourist Routes
          </Text>
          <Text className="text-white text-[22px] font-extrabold mt-0.5">
            {decodedName}
          </Text>
        </View>
        
        <View className="flex items-start py-1">
          {/* ── Section heading ──────────────────────────────────────── */}
          <View className="flex-row items-center px-5 mt-1">
            <View className="w-7 h-7 rounded-lg bg-emerald-100 items-center justify-center">
              <Ionicons name="trail-sign" size={14} color="#1f8645" />
            </View>
            <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-[1.5px] mx-2">
              Available Routes
            </Text>
            {!loading && (
              <View className="ml-auto bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Text className="text-[11px] font-bold text-emerald-800">{routes.length}</Text>
              </View>
            )}
          </View>
        </View>


      <ScrollView showsVerticalScrollIndicator={false}>


        <View className="px-5 pt-4 pb-28">

          {/* ── Skeleton loading ─────────────────────────────────────── */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {error && !loading && (
            <ErrorBanner message={error} onRetry={fetchRoutes} />
          )}

          {/* ── Empty ────────────────────────────────────────────────── */}
          {!loading && !error && routes.length === 0 && (
            <EmptyState campsiteName={decodedName} />
          )}

          {/* ── Route cards ──────────────────────────────────────────── */}
          {!loading &&
            !error &&
            routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                weather={weatherMap[route.id] ?? null}
                weatherLoading={weatherLoadingSet.has(route.id)}
                onPress={() =>
                  router.push(
                    `/screens/route-checkpoints?routeId=${route.id}&routeName=${encodeURIComponent(route.name)}&routeDifficulty=${encodeURIComponent(route.difficulty)}`
                  )
                }
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}