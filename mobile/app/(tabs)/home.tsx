import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../constants/AuthContext";
import { STARTING_POINT } from "../../data/staticData";
import WeatherCard from "../../components/WeatherCard";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import LiveMapSection from "@/components/LiveMapSection";
import { useLocationWeather } from "@/hooks/useLocationWeather";
import { useEffect, useState } from "react";
import { getCampsites } from "../../api/navigation";
import { Campsite } from "@/types/navigation-types";
import { HomeCampsiteCard } from "@/components/HomeCampsiteCard";

// ─── Layout constants ─────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = 20;
const ACTION_GAP = 12;
const ACTION_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - ACTION_GAP * 2) / 3;

// ─── Quick action config ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Select\nRoute", icon: "map"  as const, bg: "#1f8645", route: "/(tabs)/routes"    },
  { label: "Vehicle\nCheck",icon: "car-sport"  as const, bg: "#0284c7", route: "/screens/vehicle-check" },
  { label: "Emergency",     icon: "call" as const, bg: "#f97316", route: "/screens/emergency" },
] as const;

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 bg-white/10 rounded-2xl px-2 py-3 items-center mx-1">
      <Ionicons name={icon} size={17} color="rgba(255,255,255,0.85)" />
      <Text className="text-white text-sm font-bold">{value}</Text>
      <Text className="text-forest-300 text-[10px] font-medium">{label}</Text>
    </View>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2 mt-6 mb-3">
      <View className="w-7 h-7 rounded-lg bg-forest-100 items-center justify-center">
        <Ionicons name={icon} size={14} color="#1f8645" />
      </View>
      <Text className="text-slate-700 text-xs font-bold uppercase tracking-widest flex-1">
        {label}
      </Text>
    </View>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────
function QuickActionCard({
  action,
  onPress,
}: {
  action: (typeof QUICK_ACTIONS)[number];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        width: ACTION_WIDTH,
        backgroundColor: action.bg,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.2)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={action.icon} size={20} color="white" />
      </View>
      <Text
        style={{
          color: "white",
          fontSize: 11,
          fontWeight: "700",
          textAlign: "center",
          lineHeight: 15,
        }}
      >
        {action.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Live weather ──────────────────────────────────────────────────────────
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } =
    useLocationWeather();

  // ── Live campsites ────────────────────────────────────────────────────────
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [campsitesLoading, setCampsitesLoading] = useState(true);
  const [campsitesError, setCampsitesError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCampsites();
        setCampsites(res.data.filter((c) => c.is_active));
      } catch {
        setCampsitesError("Failed to load campsites.");
      } finally {
        setCampsitesLoading(false);
      }
    })();
  }, []);

  const firstName = user?.username.split(" ")[0] ?? "Travel";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

        {/* ── Hero header ──────────────────────────────────────────────── */}
        <View
          className="bg-green-900 px-5 py-6"
          style={{
            shadowColor: "#0f5229",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-forest-300 text-xs font-medium tracking-wider uppercase">
                {greeting}
              </Text>
              <Text className="text-white text-2xl font-bold mt-0.5">{firstName}</Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/screens/emergency")}
              className="flex-row items-center bg-red-500 px-4 py-2.5 rounded-2xl"
              activeOpacity={0.8}
              style={{
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="warning" size={14} color="white" />
              <Text className="text-white text-xs font-bold tracking-wide ml-1.5">SOS</Text>
            </TouchableOpacity>
          </View>

          {/* Location badge */}
          <TouchableOpacity
            className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3.5"
            activeOpacity={0.7}
          >
            <View className="w-9 h-9 rounded-xl bg-forest-600 items-center justify-center mr-3">
              <Ionicons name="location" size={18} color="#a8e6b8" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold">
                {weather?.locationName ?? STARTING_POINT.name}
              </Text>
              <Text className="text-forest-300 text-xs mt-0.5">
                {weather
                  ? `${weather.latitude.toFixed(4)}°N, ${weather.longitude.toFixed(4)}°E`
                  : `${STARTING_POINT.municipality}, ${STARTING_POINT.province}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          {/* Stats */}
          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <StatPill icon="trail-sign" value="35" label="Routes" />
            <StatPill
              icon="flag"
              value={campsitesLoading ? "…" : String(campsites.length)}
              label="Camps"
            />
            <StatPill icon="walk" value="N/A km" label="Tracked" />
            <StatPill icon="star" value="N/A" label="Rating" />
          </View>
        </View>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <View className="px-5">

          <SectionHeading icon="navigate" label="Route to Mapanuepe" />
          <LiveMapSection />

          {/* Weather */}
          <SectionHeading icon="partly-sunny" label="Weather at Your Location" />
          <WeatherCard
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            onPress={() => router.push("/screens/weather-detail")}
            onRefresh={refreshWeather}
          />

          {/* Quick Actions */}
          <SectionHeading icon="flash" label="Quick Actions" />
          <View style={{ flexDirection: "row", gap: ACTION_GAP }}>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.label}
                action={action}
                onPress={() => router.push(action.route as any)}
              />
            ))}
          </View>

          {/* ── Camp Destinations ─────────────────────────────────────── */}
          <SectionHeading icon="bonfire" label="Camp Destinations" />

          <View className="pb-28">
            {campsitesLoading && (
              <View className="items-center py-10 gap-2">
                <ActivityIndicator size="small" color="#1f8645" />
                <Text className="text-slate-400 text-xs">Loading campsites…</Text>
              </View>
            )}

            {campsitesError && !campsitesLoading && (
              <View className="items-center py-8 gap-2">
                <Ionicons name="cloud-offline-outline" size={28} color="#94a3b8" />
                <Text className="text-slate-400 text-sm">{campsitesError}</Text>
              </View>
            )}

            {!campsitesLoading && !campsitesError && campsites.length === 0 && (
              <View className="items-center py-8 gap-2">
                <Ionicons name="bonfire-outline" size={28} color="#94a3b8" />
                <Text className="text-slate-400 text-sm">No campsites available</Text>
              </View>
            )}

            {!campsitesLoading && !campsitesError && campsites.map((campsite) => (
              <HomeCampsiteCard
                key={campsite.id}
                campsite={campsite}
                onPress={() =>
                  router.push(
                    `/screens/campsite-routes?campsiteId=${campsite.id}&campsiteName=${encodeURIComponent(campsite.name)}&campsitePhase=${encodeURIComponent(campsite.phase)}`
                  )
                }
              />
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}