import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  getMyRegistrations,
  getMyRegistrationHistory,
  MyRegistration,
} from "@/api/trekking";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  registered: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "#22c55e" },
  completed:  { bg: "bg-slate-100",   text: "text-slate-600",   dot: "#94a3b8" },
  cancelled:  { bg: "bg-red-100",     text: "text-red-700",     dot: "#ef4444" },
  overdue:    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "#f59e0b" },
};

// ─── Registration card ─────────────────────────────────────────────────────
function RegistrationCard({
  item,
  onPress,
}: {
  item: MyRegistration;
  onPress: () => void;
}) {
  const statusCfg =
    STATUS_CONFIG[item.status] ?? STATUS_CONFIG.registered;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="bg-white rounded-2xl mb-3 overflow-hidden border border-slate-100"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Top accent */}
      <View
        className="h-1 w-full"
        style={{ backgroundColor: statusCfg.dot }}
      />

      <View className="p-4">
        {/* Header row */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-slate-900 text-sm font-bold leading-5">
              {item.route_name}
            </Text>
            <Text className="text-forest-700 text-xs font-bold mt-0.5">
              {item.permit_number}
            </Text>
          </View>
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full ${statusCfg.bg}`}
          >
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusCfg.dot }}
            />
            <Text className={`text-[10px] font-bold capitalize ml-1.5 ${statusCfg.text}`}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Info chips */}
        <View className="flex-row gap-2 mb-3">
          <View className="flex-row items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <Ionicons name="people" size={11} color="#64748b" />
            <Text className="text-slate-500 text-[11px] font-semibold">
              {item.group_size} {item.group_size === 1 ? "person" : "people"}
            </Text>
          </View>
          {item.is_overdue && (
            <View className="flex-row items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              <Ionicons name="warning" size={11} color="#d97706" />
              <Text className="text-amber-700 text-[11px] font-bold">Overdue</Text>
            </View>
          )}
        </View>

        {/* Schedule */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5px]">
              Entry
            </Text>
            <Text className="text-xs text-slate-700 font-bold mt-0.5">
              {formatDate(item.planned_entry)}
            </Text>
          </View>
          <View className="flex-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5px]">
              Exit
            </Text>
            <Text className="text-xs text-slate-700 font-bold mt-0.5">
              {formatDate(item.planned_exit)}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <View className="flex-row items-center justify-end mt-3">
          <Text className="text-forest-700 text-[11px] font-bold mr-1">
            View details & QR
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#15803d" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-3">
        <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
      </View>
      <Text className="text-slate-500 text-sm text-center">{message}</Text>
    </View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────────
type Tab = "active" | "history";

export default function MyRegistrations() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("active");
  const [activeItems, setActiveItems] = useState<MyRegistration[]>([]);
  const [historyItems, setHistoryItems] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const [activeRes, histRes] = await Promise.all([
        getMyRegistrations(),
        getMyRegistrationHistory(),
      ]);
      setActiveItems(activeRes.data.results);
      setHistoryItems(histRes.data.results);
    } catch {
      setError("Failed to load registrations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const currentItems = tab === "active" ? activeItems : historyItems;

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
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-forest-300 text-[10px] font-medium tracking-wider uppercase">
              Tourism
            </Text>
            <Text className="text-white text-xl font-bold mt-0.5">
              My Registrations
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => fetchAll(true)}
            className="w-9 h-9 rounded-full bg-white/15 items-center justify-center"
          >
            <Ionicons name="refresh" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white/10 rounded-2xl p-1 gap-1">
          {(["active", "history"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl items-center flex-row justify-center ${
                tab === t ? "bg-white" : ""
              }`}
            >
              <Ionicons
                name={t === "active" ? "navigate" : "time"}
                size={12}
                color={tab === t ? "#15803d" : "#a3c4a3"}
              />
              <Text
                className={`text-xs font-bold capitalize mx-1.5 ${
                  tab === t ? "text-forest-700" : "text-forest-200"
                }`}
              >
                {t === "active" ? "Active" : "History"}
              </Text>
              <View
                className={`px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-forest-100" : "bg-white/15"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    tab === t ? "text-forest-700" : "text-white"
                  }`}
                >
                  {t === "active" ? activeItems.length : historyItems.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-12">

          {/* ── Loading ───────────────────────────────────────────────── */}
          {loading && (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#15803d" />
              <Text className="text-slate-400 text-sm mt-3">
                Loading registrations…
              </Text>
            </View>
          )}

          {/* ── Error ─────────────────────────────────────────────────── */}
          {error && !loading && (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text className="flex-1 text-sm text-red-700">{error}</Text>
              <TouchableOpacity onPress={() => fetchAll()}>
                <Text className="text-xs text-red-600 font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── List ─────────────────────────────────────────────────── */}
          {!loading && !error && currentItems.length === 0 && (
            <EmptyState
              message={
                tab === "active"
                  ? "No active registrations. Register for a route to get started."
                  : "No past registrations found."
              }
            />
          )}

          {!loading &&
            !error &&
            currentItems.map((item) => (
              <RegistrationCard
                key={item.id}
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/screens/registration-detail",
                    params: { permit: item.permit_number },
                  })
                }
              />
            ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}