import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import {
  endTrekkingSession,
  getLocationLogs,
  getSessionById,
  LocationLog,
  logLocation,
} from "@/api/trekking";
import { TrekkingSession } from "@/types/trekking-types";
import { buildLocationMapHtml } from "@/utils/buildLocationMapHtml";
import { getCheckpointsByRoute } from "@/api/navigation";
import { Checkpoint } from "@/types/navigation-types";


// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function elapsedLabel(startedAt: string, endedAt: string | null): string {
  const end = endedAt ? new Date(endedAt) : new Date();
  const mins = Math.floor(
    (end.getTime() - new Date(startedAt).getTime()) / 60000
  );
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      className={`flex-1 rounded-2xl p-3 border ${
        accent
          ? "bg-emerald-50 border-emerald-100"
          : "bg-slate-50 border-slate-100"
      }`}
    >
      <View
        className={`w-7 h-7 rounded-xl items-center justify-center mb-2 ${
          accent ? "bg-emerald-100" : "bg-slate-100"
        }`}
      >
        <Ionicons name={icon} size={13} color={accent ? "#15803d" : "#64748b"} />
      </View>
      <Text
        className={`text-[9px] font-bold uppercase tracking-[0.5px] mb-0.5 ${
          accent ? "text-emerald-500" : "text-slate-400"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`text-xs font-bold leading-4 ${
          accent ? "text-emerald-800" : "text-slate-700"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Location log row ─────────────────────────────────────────────────────────
function LocationRow({
  log,
  index,
  total,
}: {
  log: LocationLog;
  index: number;
  total: number;
}) {
  const isLatest = index === 0;
  return (
    <View className="flex-row gap-3">
      <View className="items-center" style={{ width: 24 }}>
        <View
          className={`w-2.5 h-2.5 rounded-full mt-1 ${
            isLatest ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
        {index < total - 1 && (
          <View className="w-px flex-1 bg-slate-100 mt-1" />
        )}
      </View>
      <View className="flex-1 pb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={`text-xs font-bold ${
              isLatest ? "text-emerald-700" : "text-slate-700"
            }`}
          >
            {isLatest ? "Latest · " : ""}
            {formatDateTime(log.recorded_at)}
          </Text>
          {isLatest && (
            <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
              <Text className="text-[9px] font-bold text-emerald-700">
                LATEST
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="arrow-up-circle-outline" size={11} color="#94a3b8" />
            <Text className="text-slate-500 text-[11px]">
              {parseFloat(log.latitude).toFixed(6)}°
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="arrow-forward-circle-outline"
              size={11}
              color="#94a3b8"
            />
            <Text className="text-slate-500 text-[11px]">
              {parseFloat(log.longitude).toFixed(6)}°
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────
type Tab = "map" | "list";

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <View className="flex-row bg-slate-100 rounded-2xl p-1 mb-4">
      {(["map", "list"] as Tab[]).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onChange(t)}
          className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl ${
            active === t ? "bg-white" : ""
          }`}
          style={
            active === t
              ? {
                  shadowColor: "#0f172a",
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }
              : {}
          }
        >
          <Ionicons
            name={t === "map" ? "map" : "list"}
            size={13}
            color={active === t ? "#15803d" : "#94a3b8"}
          />
          <Text
            className={`text-xs font-bold capitalize ${
              active === t ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            {t === "map" ? "Map View" : "Log List"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Map panel ────────────────────────────────────────────────────────────────
function MapPanel({
  logs,
  checkpoints,
  onTouchStart,
  onTouchEnd,
}: {
  logs: LocationLog[];
  checkpoints: Checkpoint[];
  onTouchStart: () => void;
  onTouchEnd: () => void;
}) {
  const html = buildLocationMapHtml(logs, checkpoints);

  if (logs.length === 0 && checkpoints.length === 0) {
    return (
      <View className="bg-white rounded-3xl overflow-hidden items-center justify-center py-16 border border-slate-100 min-h-[320px]">
        <View className="w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center mb-3">
          <Ionicons name="map-outline" size={26} color="#94a3b8" />
        </View>
        <Text className="text-slate-400 text-xs text-center px-8">
          No location pings yet.{"\n"}Log a location to see the map.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="rounded-lg overflow-hidden border border-slate-100 bg-white"
      style={{
        height: 380,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 4,
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        overScrollMode="never"
        bounces={false}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            console.log("Map event:", msg);
          } catch (_) {}
        }}
      />

      {/* ── Legend overlay ──────────────────────────────────────────── */}
      <View
        className="absolute top-3 left-3 bg-white/80 rounded-xl px-2.5 py-2 border border-black/[0.06]"
        pointerEvents="none"
      >
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-500" />
          <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1.5">
            Latest ping
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-blue-400" />
          <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1.5">
            Ping
          </Text>
        </View>
        {checkpoints.length > 0 && (
          <View>
            <View className="h-px bg-slate-100" />
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-[3px] bg-blue-500" />
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Waypoint
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-[3px] bg-red-500" />
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Danger
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-[3px] bg-amber-400" />
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Rest
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-[3px] bg-violet-500" />
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Camp
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-[3px] bg-orange-500" />
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Emergency
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Ping count badge ────────────────────────────────────────── */}
      <View
        className="absolute bottom-3 right-3 flex-row items-center gap-1.5 bg-[rgba(10,31,10,0.75)] rounded-full px-2.5 py-1.5"
        pointerEvents="none"
      >
        <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <Text className="text-[10px] font-semibold text-emerald-200">
          {logs.length} ping{logs.length !== 1 ? "s" : ""}
          {checkpoints.length > 0 ? ` · ${checkpoints.length} checkpoints` : ""}
        </Text>
      </View>
    </View>
  );
}

// ─── Get current location with fallback ──────────────────────────────────────
/**
 * Tries high-accuracy GPS first (8 s timeout).
 * Falls back to balanced accuracy (5 s timeout) if that fails.
 * Falls back to last known position as a last resort.
 * Throws a user-friendly Error if every method fails.
 */
async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  // 1️⃣  High accuracy (GPS chip)
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 0,
      distanceInterval: 0,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (highAccErr) {
    console.warn("[Location] High-accuracy failed, trying Balanced…", highAccErr);
  }

  // 2️⃣  Balanced accuracy (network/cell)
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (balancedErr) {
    console.warn("[Location] Balanced accuracy failed, trying last known…", balancedErr);
  }

  // 3️⃣  Last known position (cached by OS)
  try {
    const loc = await Location.getLastKnownPositionAsync();
    if (loc) {
      console.warn("[Location] Using last known position (may be stale).");
      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
    }
  } catch (lastErr) {
    console.warn("[Location] Last known position also failed.", lastErr);
  }

  // All methods exhausted
  throw new Error(
    "Unable to determine your location. Make sure GPS is enabled and you have a clear view of the sky, then try again."
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SessionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);

  const [session, setSession] = useState<TrekkingSession | null>(null);
  const [logs, setLogs] = useState<LocationLog[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [loggingLocation, setLoggingLocation] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("map");
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);



  // ── Elapsed timer ──────────────────────────────────────────────────────────
  const [, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCheckpoints = async () => {
    if (!session?.route) return;
    try {
      const res = await getCheckpointsByRoute(session.route);
      setCheckpoints(res.data);
    } catch (err) {
      console.warn("[SessionDetail] fetchCheckpoints error:", err);
    }
  };

  useEffect(() => {
    if (session?.route) {
      fetchCheckpoints();
    }
  }, [session?.route]);


  useEffect(() => {
    if (session?.is_active) {
      timerRef.current = setInterval(() => setTick((t) => t + 1), 30000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.is_active]);

  // ── Fetch session ──────────────────────────────────────────────────────────
  const fetchSession = async () => {
    try {
      const res = await getSessionById(sessionId);
      setSession(res.data);
    } catch (err: any) {
      console.error("[SessionDetail] fetchSession error:", err);
      setSessionError("Failed to load session.");
    } finally {
      setSessionLoading(false);
    }
  };

  // ── Fetch logs ─────────────────────────────────────────────────────────────
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await getLocationLogs(sessionId);
      setLogs(
        [...res.data].sort(
          (a, b) =>
            new Date(b.recorded_at).getTime() -
            new Date(a.recorded_at).getTime()
        )
      );
    } catch (err: any) {
      // Non-fatal — keep existing logs
      console.warn("[SessionDetail] fetchLogs error:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchLogs();
  }, [sessionId]);

  // ── Log current location ───────────────────────────────────────────────────
  const handleLogLocation = async () => {
    setLoggingLocation(true);
    try {
      // 1. Check / request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please allow location access in your device settings to log your position.",
          [{ text: "OK" }]
        );
        return;
      }

      // 2. Get coordinates (with fallback chain)
      const coords = await getCurrentLocation();
      console.log("[Location] Got coords:", coords);

      // 3. Send to API
      await logLocation({
        session: sessionId,
        latitude: parseFloat(coords.latitude.toFixed(6)),
        longitude: parseFloat(coords.longitude.toFixed(6)),
      });

      // 4. Refresh log list
      await fetchLogs();

    } catch (err: any) {
      // err.message is always a readable string from getCurrentLocation()
      // or from the API call — log the real error so you can debug it
     // console.error("[Location] handleLogLocation failed:", err);

      const message =
        err?.message && typeof err.message === "string"
          ? err.message
          : "Something went wrong while logging your location. Please try again.";

      Alert.alert("Location Error", message, [{ text: "OK" }]);
    } finally {
      setLoggingLocation(false);
    }
  };

  // ── End session ────────────────────────────────────────────────────────────
  const handleEndSession = () => {
    Alert.alert(
      "End Session?",
      "This will mark your travel session as completed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            try {
              setEndingSession(true);
              await endTrekkingSession(sessionId, new Date().toISOString());
              await fetchSession();
            } catch (err: any) {
              console.error("[SessionDetail] endSession error:", err);
              Alert.alert("Error", "Failed to end session. Please try again.");
            } finally {
              setEndingSession(false);
            }
          },
        },
      ]
    );
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="text-slate-400 text-sm mt-3">Loading session…</Text>
      </SafeAreaView>
    );
  }

  if (sessionError || !session) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-8">
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-slate-700 font-bold text-lg mt-3 text-center">
          {sessionError ?? "Session not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-slate-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-slate-600 font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const latestLog = logs[0] ?? null;

  console.log("Rendering SessionDetail with session:", session);
  console.log("Latest log:", latestLog);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View
        className="bg-green-900 px-5 pt-4 pb-5"
        style={{
          shadowColor: "#0f5229",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/15 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={18} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold flex-1">
            Session Detail
          </Text>
          {/* {session.is_active && (
            <View className="flex-row items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <Text className="text-emerald-300 text-[11px] font-bold">
                LIVE
              </Text>
            </View>
          )} */}
        </View>

        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-forest-300 text-[10px] font-bold uppercase tracking-wider">
              Session
            </Text>
            <Text className="text-white text-2xl font-extrabold mt-0.5">
              #{session.id}
            </Text>
            <Text className="text-forest-300 text-xs mt-0.5">
              Route {session.route}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-forest-300 text-[10px] font-bold uppercase tracking-wider">
              {session.is_active ? "Elapsed" : "Duration"}
            </Text>
            <Text className="text-white text-xl font-bold mt-0.5">
              {elapsedLabel(session.started_at, session.ended_at)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-12">

          {/* ── Time stats ────────────────────────────────────────────────── */}
          <View className="flex-row gap-3 mb-4">
            <StatPill
              icon="play-circle"
              label="Started"
              value={`${formatTime(session.started_at)}\n${formatDate(session.started_at)}`}
            />
            {session.ended_at ? (
              <StatPill
                icon="stop-circle"
                label="Ended"
                value={`${formatTime(session.ended_at)}\n${formatDate(session.ended_at)}`}
              />
            ) : (
              <StatPill
                icon="timer"
                label="Elapsed"
                value={elapsedLabel(session.started_at, null)}
                accent
              />
            )}
            <StatPill
              icon="location"
              label="Pings"
              value={logsLoading ? "…" : `${logs.length}`}
              accent={logs.length > 0}
            />
          </View>

          {/* ── Log location button (active only) ──────────────────────── */}
          {session.is_active && (
            <TouchableOpacity
              onPress={handleLogLocation}
              disabled={loggingLocation}
              activeOpacity={0.85}
              className="mb-4 rounded-2xl overflow-hidden"
              style={{
                opacity: loggingLocation ? 0.75 : 1,
                shadowColor: "#15803d",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <View className="bg-forest-700 flex-row items-center justify-center gap-2.5 py-4">
                {loggingLocation ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="locate" size={18} color="white" />
                )}
                <Text className="text-white text-sm font-extrabold">
                  {loggingLocation
                    ? "Getting your location…"
                    : "Log My Current Location"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── Tab switcher ─────────────────────────────────────────────── */}
          <TabBar active={activeTab} onChange={setActiveTab} />

          {/* ── MAP TAB ───────────────────────────────────────────────────── */}
          {activeTab === "map" && (
            <>
              {logsLoading ? (
                <View
                  className="bg-white rounded-3xl items-center justify-center border border-slate-100"
                  style={{ height: 380 }}
                >
                  <ActivityIndicator size="large" color="#15803d" />
                  <Text className="text-slate-400 text-xs mt-3">
                    Loading map…
                  </Text>
                </View>
              ) : (
                <MapPanel
                  logs={logs}
                  checkpoints={checkpoints}
                  onTouchStart={() => setScrollEnabled(false)}
                  onTouchEnd={() => setScrollEnabled(true)}
                />
              )}

              {!logsLoading && logs.length > 0 && (
                <View className="flex-row items-center justify-center gap-2 mt-3">
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <Text className="text-slate-400 text-[11px]">
                    {logs.length} ping{logs.length !== 1 ? "s" : ""} plotted ·
                    tap a marker for details
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ── LIST TAB ──────────────────────────────────────────────────── */}
          {activeTab === "list" && (
            <>
              {/* Latest location card */}
              {latestLog && (
                <View
                  className="bg-white rounded-3xl p-4 mb-4 border border-emerald-100"
                  style={{
                    shadowColor: "#0f172a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.07,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="w-7 h-7 rounded-lg bg-emerald-100 items-center justify-center">
                      <Ionicons name="location" size={13} color="#15803d" />
                    </View>
                    <Text className="text-slate-700 text-xs font-bold uppercase tracking-widest flex-1">
                      Last Known Location
                    </Text>
                    <Text className="text-slate-400 text-[10px]">
                      {formatDateTime(latestLog.recorded_at)}
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5px] mb-1">
                        Latitude
                      </Text>
                      <Text className="text-sm text-slate-800 font-bold">
                        {parseFloat(latestLog.latitude).toFixed(6)}°
                      </Text>
                    </View>
                    <View className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5px] mb-1">
                        Longitude
                      </Text>
                      <Text className="text-sm text-slate-800 font-bold">
                        {parseFloat(latestLog.longitude).toFixed(6)}°
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Location history list */}
              <View
                className="bg-white rounded-3xl p-4 mb-4"
                style={{
                  shadowColor: "#0f172a",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.07,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="flex-row items-center gap-2 mb-4">
                  <View className="w-7 h-7 rounded-lg bg-forest-100 items-center justify-center">
                    <Ionicons name="trail-sign" size={13} color="#1f8645" />
                  </View>
                  <Text className="text-slate-700 text-xs font-bold uppercase tracking-widest flex-1">
                    Location History
                  </Text>
                  <TouchableOpacity onPress={fetchLogs}>
                    <Ionicons name="refresh" size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {logsLoading ? (
                  <View className="items-center py-6">
                    <ActivityIndicator size="small" color="#15803d" />
                    <Text className="text-slate-400 text-xs mt-2">
                      Loading logs…
                    </Text>
                  </View>
                ) : logs.length === 0 ? (
                  <View className="items-center py-6">
                    <View className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mb-2">
                      <Ionicons
                        name="location-outline"
                        size={22}
                        color="#94a3b8"
                      />
                    </View>
                    <Text className="text-slate-400 text-xs text-center">
                      No location pings yet.
                      {session.is_active
                        ? "\nTap Log My Current Location to start tracking."
                        : ""}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {logs.map((log, i) => (
                      <LocationRow
                        key={log.id}
                        log={log}
                        index={i}
                        total={logs.length}
                      />
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

          {/* ── End session button (active only) ──────────────────────────── */}
          {session.is_active && (
            <TouchableOpacity
              onPress={handleEndSession}
              disabled={endingSession}
              activeOpacity={0.82}
              className="flex-row items-center justify-center bg-red-100 border border-red-200 rounded-2xl py-3 mt-2"
              style={{ opacity: endingSession ? 0.6 : 1 }}
            >
              {endingSession ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Ionicons name="stop-circle" size={18} color="#dc2626" />
              )}
              <Text className="text-red-600 text-sm font-bold mx-2">
                {endingSession ? "Ending session…" : "End This Session"}
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Completed banner ──────────────────────────────────────────── */}
          {!session.is_active && (
            <View className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex-row items-center gap-3 mt-2">
              <View className="w-10 h-10 rounded-xl bg-slate-200 items-center justify-center">
                <Ionicons name="checkmark-circle" size={20} color="#64748b" />
              </View>
              <View>
                <Text className="text-slate-700 text-sm font-bold">
                  Session Completed
                </Text>
                {session.ended_at && (
                  <Text className="text-slate-400 text-xs mt-0.5">
                    Ended {formatDateTime(session.ended_at)}
                  </Text>
                )}
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}