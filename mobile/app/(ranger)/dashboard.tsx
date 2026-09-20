import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/constants/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { getRangerDashboard, getRangerRegistrations, Registration } from "@/api/ranger";

type Icon = React.ComponentProps<typeof Ionicons>["name"];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: Icon;
  value: string | number;
  label: string;
  accent: "green" | "blue" | "orange";
}) {
  const iconBg = {
    green: "bg-green-400/20",
    blue: "bg-blue-400/20",
    orange: "bg-orange-400/20",
  }[accent];

  const iconColor = {
    green: "#4cde80",
    blue: "#60a5fa",
    orange: "#fb923c",
  }[accent];

  return (
    <View className="flex-1 rounded-2xl p-4 mx-1 bg-white/10 border border-white/10 min-w-0">
      <View className={`w-9 h-9 rounded-xl items-center justify-center mb-3 ${iconBg}`}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text className="text-white text-2xl font-extrabold">{value}</Text>
      <Text className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">
        {label}
      </Text>
    </View>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function Section({ label, icon }: { label: string; icon: Icon }) {
  return (
    <View className="flex-row items-center gap-2 mb-3 mt-7">
      <View className="w-6 h-6 rounded-lg bg-green-100 items-center justify-center">
        <Ionicons name={icon} size={12} color="#15803d" />
      </View>
      <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
        {label}
      </Text>
    </View>
  );
}

// ─── Quick action ─────────────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  variant,
  onPress,
}: {
  icon: Icon;
  label: string;
  variant: "green" | "blue" | "orange";
  onPress: () => void;
}) {
  const cardBg = { green: "bg-green-50", blue: "bg-blue-50", orange: "bg-orange-50" }[variant];
  const iconBg = { green: "bg-green-100", blue: "bg-blue-100", orange: "bg-orange-100" }[variant];
  const iconColor = { green: "#15803d", blue: "#1d4ed8", orange: "#c2410c" }[variant];
  const textColor = { green: "text-green-700", blue: "text-blue-700", orange: "text-orange-700" }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-1 rounded-2xl py-5 items-center mx-1 ${cardBg}`}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${iconBg}`}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text className={`mt-1 text-[12px] font-bold text-center ${textColor}`}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Recent activity row ──────────────────────────────────────────────────────
function ActivityRow({ item, isLast }: { item: Registration; isLast: boolean }) {
  const name = item.name || item.username || item.trekker_name || item.full_name || "Unknown";
  const action = item.status || item.action || null;
  const isEntry = action === "entry";
  const isExit = action === "exit";

  // Pick a secondary detail to show (id, tracking_id, date, etc.)
  const detail =
    item.tracking_id || item.trekker_id || item.id
      ? `ID: ${item.tracking_id ?? item.trekker_id ?? item.id}`
      : item.date || item.created_at || item.timestamp
      ? String(item.date ?? item.created_at ?? item.timestamp)
      : null;

  return (
    <View
      className={`flex-row items-center gap-3 py-3 ${!isLast ? "border-b border-gray-100" : ""}`}
    >
      {/* Action indicator */}
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{
          backgroundColor: isEntry
            ? "rgba(22,163,74,0.1)"
            : isExit
            ? "rgba(59,130,246,0.1)"
            : "rgba(107,114,128,0.1)",
        }}
      >
        <Ionicons
          name={isEntry ? "enter-outline" : isExit ? "exit-outline" : "person-outline"}
          size={16}
          color={isEntry ? "#16a34a" : isExit ? "#3b82f6" : "#6b7280"}
        />
      </View>

      {/* Name + detail */}
      <View className="flex-1">
        <Text className="text-gray-800 text-[13px] font-semibold" numberOfLines={1}>
          {String(name)}
        </Text>
        {detail && (
          <Text className="text-gray-400 text-[11px] mt-0.5" numberOfLines={1}>
            {detail}
          </Text>
        )}
      </View>

      {/* Badge */}
      {action && (
        <View
          className="px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: isEntry
              ? "rgba(22,163,74,0.08)"
              : isExit
              ? "rgba(59,130,246,0.08)"
              : "rgba(107,114,128,0.08)",
          }}
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: isEntry ? "#16a34a" : isExit ? "#3b82f6" : "#6b7280",
            }}
          >
            {action}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function RangerDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, regRes] = await Promise.all([
        getRangerDashboard(),
        getRangerRegistrations(1, 5), // fetch latest 5 for activity feed
      ]);
      setDashboard(dashRes.data);
      setRecentActivity(regRes.data.results ?? []);
    } catch (err) {
      console.log("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View className="bg-green-900 px-5 pt-6 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <Text className="text-green-400 text-[11px] font-bold uppercase tracking-widest">
                {greeting}
              </Text>
              <Text className="text-white text-[26px] font-extrabold mt-0.5 tracking-tight">
                {user?.first_name || user?.username || "Ranger"}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <View className="w-2 h-2 rounded-full bg-green-400" />
                <Text className="text-green-400 text-[11px] font-semibold">
                  On Duty · Park Ranger
                </Text>
              </View>
            </View>
            <View className="w-14 h-14 rounded-2xl items-center justify-center bg-green-400/15 border border-green-400/25">
              <Ionicons name="shield-checkmark" size={26} color="#4cde80" />
            </View>
          </View>

          {/* Stat grid */}
          {loading ? (
            <View className="items-center py-6">
              <ActivityIndicator color="#4cde80" />
            </View>
          ) : (
            <View className="flex-row">
              <StatCard
                icon="people"
                value={dashboard?.active_trekkers ?? dashboard?.total_trekkers ?? "—"}
                label="Active"
                accent="green"
              />
              <StatCard
                icon="enter"
                value={dashboard?.entries_today ?? dashboard?.today_entries ?? "—"}
                label="Entries"
                accent="blue"
              />
              <StatCard
                icon="exit"
                value={dashboard?.exits_today ?? dashboard?.today_exits ?? "—"}
                label="Exits"
                accent="orange"
              />
            </View>
          )}
        </View>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <View className="px-5 pb-28">
          {/* Quick actions */}
          <Section label="Quick Actions" icon="flash" />
          <View className="flex-row">
            <QuickAction
              icon="qr-code-outline"
              label="Scan Entry"
              variant="green"
              onPress={() => router.push("/(ranger)/scan")}
            />
            <QuickAction
              icon="log-out-outline"
              label="Scan Exit"
              variant="blue"
              onPress={() => router.push("/(ranger)/scan")}
            />
            <QuickAction
              icon="list-outline"
              label="Tourist"
              variant="orange"
              onPress={() => router.push("/(ranger)/registrations")}
            />
          </View>

          {/* Recent activity feed */}
          <Section label="Recent Activity" icon="pulse" />
          <View className="bg-white rounded-2xl px-4 pt-1 pb-1 shadow-sm">
            {loading ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#22c55e" size="small" />
              </View>
            ) : recentActivity.length > 0 ? (
              <>
                {recentActivity.map((item, i) => (
                  <ActivityRow
                    key={item.id ?? item.tracking_id ?? i}
                    item={item}
                    isLast={i === recentActivity.length - 1}
                  />
                ))}
                <TouchableOpacity
                  onPress={() => router.push("/(ranger)/registrations")}
                  className="py-3 items-center border-t border-gray-100 mt-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-green-700 text-[12px] font-bold">
                    View all Travel →
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="items-center py-6 gap-1">
                <Ionicons name="people-outline" size={28} color="#d1d5db" />
                <Text className="text-gray-300 text-[12px] font-medium">No activity yet</Text>
              </View>
            )}
          </View>

          {/* Station overview from dashboard */}
          {dashboard && Object.keys(dashboard).length > 0 && (
            <>
              <Section label="Station Overview" icon="analytics" />
              <View className="bg-white rounded-2xl px-4 pt-1 pb-1 shadow-sm">
                {Object.entries(dashboard).map(([key, val], i, arr) => (
                  <View
                    key={key}
                    className={`flex-row justify-between items-center py-3 ${
                      i < arr.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <Text className="text-gray-400 text-[13px] font-medium capitalize">
                      {key.replace(/_/g, " ")}
                    </Text>
                    <View className="bg-green-50 rounded-lg px-3 py-1">
                      <Text className="text-green-700 text-[13px] font-bold">
                        {String(val)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Duty status */}
          <Section label="Duty Status" icon="time" />
          <View className="bg-white rounded-2xl p-4 flex-row items-center gap-4 shadow-sm">
            <View className="w-12 h-12 rounded-2xl items-center justify-center bg-green-50">
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-[15px] font-bold">Active Shift</Text>
              <Text className="text-gray-400 text-[12px] mt-0.5">
                You are currently on duty and monitoring the park.
              </Text>
            </View>
          </View>

          {/* Sign out */}
          <TouchableOpacity
            onPress={signOut}
            activeOpacity={0.8}
            className="mt-8 flex-row items-center justify-center rounded-md py-3 bg-rose-100 border border-rose-200"
          >
            <Ionicons name="log-out-outline" size={18} color="#e11d48" />
            <Text className="text-rose-600 text-[14px] font-bold mx-2">End Duty & Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}