import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { endTrekkingSession, getTrekkingSessions } from "@/api/trekking";
import { TrekkingSession } from "@/types/trekking-types";
import { SessionCard } from "@/components/trek/session-card";
import { EmptyState } from "@/components/trek/EmptyState";



// ─── Empty state ──────────────────────────────────────────────────────────────


// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Trek() {
  const router = useRouter();

  const [sessions, setSessions] = useState<TrekkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endingSessionId, setEndingSessionId] = useState<number | null>(null);

  const activeSessions = sessions.filter((s) => s.is_active);
  const inactiveSessions = sessions.filter((s) => !s.is_active);

  const fetchSessions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await getTrekkingSessions();
      setSessions(res.data);
    } catch {
      setError("Failed to load sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleEndSession = (sessionId: number) => {
    Alert.alert(
      "End Session?",
      "Are you sure you want to end this travel session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            try {
              setEndingSessionId(sessionId);
              await endTrekkingSession(sessionId, new Date().toISOString());
              await fetchSessions(true);
            } catch {
              Alert.alert("Error", "Failed to end session. Please try again.");
            } finally {
              setEndingSessionId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#fff" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View
        className="bg-white px-5 pt-3 pb-4 border-b border-slate-100"
        style={{
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[1.2px]">
              Active Travel
            </Text>
            <Text className="text-xl font-extrabold text-slate-900 mt-0.5">
              My Sessions
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {/* {activeSessions.length > 0 && (
              <View className="flex-row items-center bg-emerald-100 px-2.5 py-1 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <Text className="text-[10px] font-bold text-emerald-700 mx-1.5">
                  {activeSessions.length} active
                </Text>
              </View>
            )} */}
            <TouchableOpacity
              onPress={() => fetchSessions(true)}
              className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="refresh" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-10">
          {/* ── Loading ───────────────────────────────────────────────── */}
          {loading && (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#15803d" />
              <Text className="text-slate-400 text-sm mt-3">
                Loading sessions…
              </Text>
            </View>
          )}

          {/* ── Error ─────────────────────────────────────────────────── */}
          {error && !loading && (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="flex-1 text-sm text-red-700">{error}</Text>
              <TouchableOpacity onPress={() => fetchSessions()}>
                <Text className="text-xs text-red-600 font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Empty state ───────────────────────────────────────────── */}
          {!loading && !error && sessions.length === 0 && (
            <EmptyState onStartRoute={() => router.push("/(tabs)/routes")} />
          )}

          {/* ── Active sessions ───────────────────────────────────────── */}
          {!loading && activeSessions.length > 0 && (
            <>
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-6 h-6 rounded-lg bg-emerald-100 items-center justify-center">
                  <Ionicons name="navigate" size={12} color="#15803d" />
                </View>
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-[1.5px]">
                  Active Sessions
                </Text>
                <View className="ml-auto bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <Text className="text-[11px] font-bold text-emerald-800">
                    {activeSessions.length}
                  </Text>
                </View>
              </View>
              {activeSessions.map((s, i) => (
                <View
                  key={s.id}
                  style={{ opacity: endingSessionId === s.id ? 0.5 : 1 }}
                >
                  <SessionCard
                    session={s}
                    index={i}
                    onEnd={() => handleEndSession(s.id)}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/session-detail",
                        params: { id: s.id },
                      })
                    }
                  />
                </View>
              ))}
            </>
          )}

          {/* ── Past sessions ─────────────────────────────────────────── */}
          {!loading && inactiveSessions.length > 0 && (
            <>
              <View className="flex-row items-center gap-2 mb-3 mt-2">
                <View className="w-6 h-6 rounded-lg bg-slate-100 items-center justify-center">
                  <Ionicons name="time" size={12} color="#64748b" />
                </View>
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-[1.5px]">
                  Past Sessions
                </Text>
                <View className="ml-auto bg-slate-100 px-2.5 py-0.5 rounded-full">
                  <Text className="text-[11px] font-bold text-slate-600">
                    {inactiveSessions.length}
                  </Text>
                </View>
              </View>
              {inactiveSessions.map((s, i) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  index={i}
                  onEnd={() => {}}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/session-detail",
                      params: { id: s.id },
                    })
                  }
                />
              ))}
            </>
          )}

          {/* ── Start new route ───────────────────────────────────────── */}
          {!loading && sessions.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/routes")}
              activeOpacity={0.82}
              className="flex-row items-center justify-center bg-forest-700/10 border border-forest-700/20 rounded-2xl py-3 my-2"
            >
              <Ionicons name="add-circle-outline" size={17} color="#15803d" />
              <Text className="text-forest-700 text-sm font-bold mx-1.5">
                Start Another Route
              </Text>
            </TouchableOpacity>
          )}

          {/* ── SOS ─────────────────────────────────────────────────────── */}
          <TouchableOpacity
            className="w-full rounded-2xl overflow-hidden"
            activeOpacity={0.85}
            onPress={() => router.push("/screens/emergency")}
            style={{
              shadowColor: "#dc2626",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <View className="bg-red-500 flex-row items-center justify-center py-3">
              <Ionicons name="warning" size={18} color="white" />
              <Text className="text-white text-base font-extrabold mx-1.5">
                 Emergency SOS
              </Text>
              {/* <Text className="text-red-200 text-xs">
                · sends GPS + alerts rescue
              </Text> */}
            </View>
          </TouchableOpacity>
          

        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
}