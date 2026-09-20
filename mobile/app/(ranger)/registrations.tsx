import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { getRangerRegistrations, Registration } from "@/api/ranger";

// ─── Registration card ────────────────────────────────────────────────────────
function RegCard({ item }: { item: Registration }) {
  const entries = Object.entries(item);
  const primaryKey =
    item.name || item.username || item.trekker_name || item.id || "—";
  const statusVal = item.status || item.action || null;

  return (
    <View className="rounded-2xl p-4 mb-3 bg-white border border-gray-100 shadow-sm">
      {/* Top row */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-9 h-9 rounded-xl items-center justify-center bg-green-100">
            <Ionicons name="person" size={16} color="#16a34a" />
          </View>
          <Text
            className="text-gray-800 text-[14px] font-bold flex-1"
            numberOfLines={1}
          >
            {String(primaryKey)}
          </Text>
        </View>

        {statusVal && (
          <View
            className="px-2.5 py-1 rounded-full"
            style={{
              backgroundColor:
                statusVal === "entry"
                  ? "rgba(22,163,74,0.1)"
                  : statusVal === "exit"
                  ? "rgba(59,130,246,0.1)"
                  : "rgba(0,0,0,0.05)",
            }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{
                color:
                  statusVal === "entry"
                    ? "#16a34a"
                    : statusVal === "exit"
                    ? "#3b82f6"
                    : "#9ca3af",
              }}
            >
              {statusVal}
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="gap-1">
        {entries
          .filter(([k]) => !["name", "username", "trekker_name", "status", "action"].includes(k))
          .slice(0, 4)
          .map(([k, v]) => (
            <View key={k} className="flex-row justify-between">
              <Text className="text-[11px] capitalize text-gray-400">
                {k.replace(/_/g, " ")}
              </Text>
              <Text className="text-[11px] font-medium text-gray-600">
                {String(v ?? "—")}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="items-center py-16 gap-3">
      <View className="w-16 h-16 rounded-2xl items-center justify-center bg-gray-100">
        <Ionicons name="people-outline" size={32} color="#d1d5db" />
      </View>
      <Text className="text-gray-400 text-[13px] font-medium">
        No registrations yet
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function RegistrationsScreen() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (p = 1, replace = true) => {
    try {
      const res = await getRangerRegistrations(p);
      const payload = res.data;
      setTotalPages(payload.pages);
      setData((prev) =>
        replace ? payload.results : [...prev, ...payload.results]
      );
    } catch (err) {
      console.log("Registrations error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchData(1, true);
  };

  const loadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchData(nextPage, false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      {/* Header */}
      <View className="px-5 pt-5 pb-5 bg-green-900">
        <Text className="text-[#4cde80] text-[11px] font-bold uppercase tracking-widest mb-1">
          Ranger Control
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-extrabold tracking-tight">
            Tourists
          </Text>
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "rgba(76,222,128,0.12)" }}
          >
            <Text className="text-[#4cde80] text-[12px] font-bold">
              {data.length} logged
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#16a34a" size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <RegCard item={item} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 100, backgroundColor: "#f9fafb" }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#16a34a"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#16a34a" style={{ paddingVertical: 16 }} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}