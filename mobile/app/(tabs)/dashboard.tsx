import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { DASHBOARD_STATS, WEATHER_DATA, CAMPS } from "../../data/staticData";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { getMyRegistrations, MyRegistration } from "@/api/trekking";

// ─── Types ────────────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

// ─── Status configs ───────────────────────────────────────────────────────────
const ROUTE_STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dotColor: string }
> = {
  Open:    { bg: "bg-emerald-100", text: "text-emerald-700", dotColor: "#22c55e" },
  Caution: { bg: "bg-amber-100",   text: "text-amber-700",   dotColor: "#f59e0b" },
  Closed:  { bg: "bg-red-100",     text: "text-red-700",     dotColor: "#ef4444" },
};

const WEATHER_STATUS_CONFIG: Record<
  string,
  { border: string; bg: string; badgeBg: string; badgeText: string; icon: IoniconName; iconColor: string }
> = {
  Safe:    { border: "border-emerald-200", bg: "bg-emerald-50", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700", icon: "checkmark-circle", iconColor: "#059669" },
  Caution: { border: "border-amber-200",   bg: "bg-amber-50",   badgeBg: "bg-amber-100",   badgeText: "text-amber-700",   icon: "warning",          iconColor: "#d97706" },
  Danger:  { border: "border-red-200",     bg: "bg-red-50",     badgeBg: "bg-red-100",     badgeText: "text-red-700",     icon: "ban",              iconColor: "#dc2626" },
};

const REG_STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  registered: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "#22c55e" },
  completed:  { bg: "bg-slate-100",   text: "text-slate-600",   dot: "#94a3b8" },
  cancelled:  { bg: "bg-red-100",     text: "text-red-700",     dot: "#ef4444" },
  overdue:    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "#f59e0b" },
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, iconBg, iconColor, trend,
}: {
  icon: IoniconName;
  label: string;
  value: number | string;
  iconBg: string;
  iconColor: string;
  trend?: string;
}) {
  return (
    <View
      className="bg-white rounded-3xl p-4"
      style={{
        width: CARD_WIDTH,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        {trend && (
          <View className="flex-row items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Ionicons name="trending-up" size={10} color="#059669" />
            <Text className="text-emerald-600 text-[10px] font-bold">{trend}</Text>
          </View>
        )}
      </View>
      <Text className="text-slate-900 text-2xl font-bold">{value}</Text>
      <Text className="text-slate-400 text-xs mt-0.5 font-medium">{label}</Text>
    </View>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({
  icon,
  label,
  action,
}: {
  icon: IoniconName;
  label: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="w-7 h-7 rounded-lg bg-forest-100 items-center justify-center">
        <Ionicons name={icon} size={14} color="#1f8645" />
      </View>
      <Text className="text-slate-700 text-xs font-bold uppercase tracking-widest flex-1">
        {label}
      </Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} className="flex-row items-center gap-1">
          <Text className="text-forest-700 text-[11px] font-bold">{action.label}</Text>
          <Ionicons name="chevron-forward" size={11} color="#15803d" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Registration card (compact) ─────────────────────────────────────────────
function RegistrationCard({
  item,
  onPress,
}: {
  item: MyRegistration;
  onPress: () => void;
}) {
  const cfg = REG_STATUS_CONFIG[item.status] ?? REG_STATUS_CONFIG.registered;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="bg-white rounded-2xl mb-2.5 overflow-hidden border border-slate-100"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Left accent bar */}
      <View className="flex-row">
        <View className="w-1 rounded-l-2xl" style={{ backgroundColor: cfg.dot }} />

        <View className="flex-1 p-3.5">
          {/* Top row */}
          <View className="flex-row items-start justify-between gap-2 mb-2">
            <View className="flex-1">
              <Text
                className="text-slate-900 text-xs font-bold leading-4"
                numberOfLines={2}
              >
                {item.route_name}
              </Text>
              <Text className="text-forest-700 text-[10px] font-bold mt-0.5">
                {item.permit_number}
              </Text>
            </View>
            <View className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${cfg.bg}`}>
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cfg.dot }}
              />
              <Text className={`text-[9px] font-bold capitalize ${cfg.text}`}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Bottom row */}
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="enter-outline" size={11} color="#94a3b8" />
              <Text className="text-slate-400 text-[10px]">
                {formatDate(item.planned_entry)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="people-outline" size={11} color="#94a3b8" />
              <Text className="text-slate-400 text-[10px]">
                {item.group_size} {item.group_size === 1 ? "person" : "people"}
              </Text>
            </View>
            {item.is_overdue && (
              <View className="flex-row items-center gap-0.5 ml-auto">
                <Ionicons name="warning" size={10} color="#d97706" />
                <Text className="text-amber-600 text-[9px] font-bold">Overdue</Text>
              </View>
            )}
          </View>
        </View>

        {/* Chevron */}
        <View className="items-center justify-center pr-3">
          <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const stats = DASHBOARD_STATS;
  const weather = WEATHER_DATA;
  const weatherCfg = WEATHER_STATUS_CONFIG[weather.status] ?? WEATHER_STATUS_CONFIG.Safe;

  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [regLoading, setRegLoading] = useState(true);
  const [regError, setRegError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyRegistrations();
        setRegistrations(res.data.results);
      } catch {
        setRegError(true);
      } finally {
        setRegLoading(false);
      }
    })();
  }, []);

  const statCards: {
    icon: IoniconName;
    label: string;
    value: number | string;
    iconBg: string;
    iconColor: string;
    trend?: string;
  }[] = [
    { icon: "people",       label: "Visitors Today",   value: stats.visitorsToday,      iconBg: "#dbeafe", iconColor: "#2563eb", trend: "+12%" },
    { icon: "walk",         label: "Active Travel",  value: stats.activeTrekkers,     iconBg: "#dcfce7", iconColor: "#16a34a"               },
    { icon: "calendar",     label: "This Week",        value: stats.registeredThisWeek, iconBg: "#f3e8ff", iconColor: "#9333ea", trend: "+5%"  },
    { icon: "alert-circle", label: "Incidents / Mo.",  value: stats.incidentsThisMonth, iconBg: "#ffedd5", iconColor: "#ea580c"               },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View
          className="bg-green-900 px-5 pt-5 pb-6"
          style={{
            shadowColor: "#0f5229",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Text className="text-forest-300 text-xs font-medium tracking-wider uppercase">
            Overview
          </Text>
          <Text className="text-white text-2xl font-bold mt-0.5">Tourism Dashboard</Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Ionicons name="location" size={12} color="#4caf72" />
            <Text className="text-forest-300 text-sm">
              San Marcelino Tourism Management
            </Text>
          </View>
        </View>

        <View className="px-5 pt-4 pb-28">

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <SectionHeading icon="pulse" label="Live Statistics" />
          <View className="mb-6" style={{ gap: CARD_GAP }}>
            {[statCards.slice(0, 2), statCards.slice(2, 4)].map((row, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: "row", gap: CARD_GAP }}>
                {row.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </View>
            ))}
          </View>

          {/* ── Weather status ───────────────────────────────────────────── */}
          {/* <SectionHeading icon="partly-sunny" label="Weather Status" /> */}
          {/* <View
            className={`rounded-3xl p-4 mb-6 border ${weatherCfg.bg} ${weatherCfg.border}`}
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-slate-800 text-base font-bold">{weather.condition}</Text>
                <View className="flex-row items-center gap-3 mt-1.5">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="thermometer" size={13} color="#64748b" />
                    <Text className="text-slate-500 text-xs font-medium">{weather.temperature}°C</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="water" size={13} color="#64748b" />
                    <Text className="text-slate-500 text-xs font-medium">{weather.humidity}% Humidity</Text>
                  </View>
                </View>
              </View>
              <Text className="text-4xl">{weather.icon}</Text>
            </View>
            <View className={`flex-row items-center gap-1.5 self-start px-3 py-1.5 rounded-full ${weatherCfg.badgeBg}`}>
              <Ionicons name={weatherCfg.icon} size={13} color={weatherCfg.iconColor} />
              <Text className={`text-xs font-bold ${weatherCfg.badgeText}`}>{weather.status}</Text>
            </View>
          </View> */}

          {/* ── Route status ─────────────────────────────────────────────── */}
          <SectionHeading icon="map" label="Route Status" />
          <View
            className="bg-white rounded-3xl overflow-hidden mb-6"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {CAMPS.map((camp, idx) => {
              const status = stats.routeStatus[camp.id];
              const cfg = ROUTE_STATUS_CONFIG[status] ?? ROUTE_STATUS_CONFIG.Open;
              return (
                <View
                  key={camp.id}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${
                    idx < CAMPS.length - 1 ? "border-b border-slate-50" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cfg.dotColor }}
                    />
                    <View>
                      <Text className="text-slate-800 text-sm font-semibold">{camp.name}</Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name="resize" size={10} color="#94a3b8" />
                        <Text className="text-slate-400 text-[11px]">{camp.distance} km</Text>
                      </View>
                    </View>
                  </View>
                  <View className={`flex-row items-center px-3 py-1 rounded-full ${cfg.bg}`}>
                    <Text className={`text-xs font-bold ${cfg.text}`}>{status}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── My Registrations ─────────────────────────────────────────── */}
          <SectionHeading
            icon="document-text"
            label="My Registrations"
            action={{
              label: "See all",
              onPress: () => router.push("/screens/my-registrations"),
            }}
          />

          {/* Loading */}
          {regLoading && (
            <View className="bg-white rounded-3xl p-6 items-center mb-6"
              style={{
                shadowColor: "#0f172a",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.07,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <ActivityIndicator size="small" color="#15803d" />
              <Text className="text-slate-400 text-xs mt-2">Loading registrations…</Text>
            </View>
          )}

          {/* Error */}
          {regError && !regLoading && (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={16} color="#dc2626" />
              <Text className="flex-1 text-xs text-red-700">
                Could not load registrations.
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  setRegLoading(true);
                  setRegError(false);
                  try {
                    const res = await getMyRegistrations();
                    setRegistrations(res.data.results);
                  } catch {
                    setRegError(true);
                  } finally {
                    setRegLoading(false);
                  }
                }}
              >
                <Text className="text-xs text-red-600 font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty */}
          {!regLoading && !regError && registrations.length === 0 && (
            <View
              className="bg-white rounded-3xl p-6 items-center mb-6"
              style={{
                shadowColor: "#0f172a",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.07,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <View className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mb-3">
                <Ionicons name="document-text-outline" size={24} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 text-sm text-center">
                No active registrations yet.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/routes")}
                className="mt-3 bg-forest-700/10 border border-forest-700/20 px-5 py-2.5 rounded-xl"
              >
                <Text className="text-forest-700 text-xs font-bold">Register for a Route</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List — show max 3 on dashboard */}
          {!regLoading && !regError && registrations.length > 0 && (
            <View className="mb-4">
              {registrations.slice(0, 3).map((item) => (
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

              {/* See all button if there are more than 3 */}
              {registrations.length > 3 && (
                <TouchableOpacity
                  onPress={() => router.push("/screens/my-registrations")}
                  activeOpacity={0.82}
                  className="flex-row items-center justify-center gap-2 bg-forest-700/10 border border-forest-700/20 rounded-2xl py-3.5 mt-1"
                >
                  <Text className="text-forest-700 text-xs font-bold">
                    View all {registrations.length} registrations
                  </Text>
                  <Ionicons name="arrow-forward" size={13} color="#15803d" />
                </TouchableOpacity>
              )}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}