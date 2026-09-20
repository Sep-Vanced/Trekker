import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSosAlerts } from "@/hooks/useSosAlerts";
import { SosAlert } from "@/types/sos-types";

function getElapsed(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function AlertCard({
  alert,
  onResolve,
  resolving,
}: {
  alert: SosAlert;
  onResolve: () => void;
  resolving: boolean;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-red-100 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-2xl bg-red-100 items-center justify-center">
            <Ionicons name="warning" size={20} color="#dc2626" />
          </View>
          <View>
            <Text className="text-gray-900 text-[14px] font-bold">
              {alert.trekker.name}
            </Text>
            <Text className="text-gray-400 text-[10px] font-mono">
              SOS-{String(alert.id).padStart(4, "0")}
            </Text>
          </View>
        </View>
        <Text className="text-red-500 text-[11px] font-bold">
          {getElapsed(alert.created_at)}
        </Text>
      </View>

        {alert.message && (
        <Text className="text-gray-500 text-[12px] italic mb-3">
          &ldquo;{alert.message}&rdquo;
        </Text>
      )}

      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="location" size={14} color="#dc2626" />
        <Text className="text-gray-700 text-[12px] font-medium">
          {alert.latitude != null && alert.longitude != null
            ? `${alert.latitude.toFixed(5)}, ${alert.longitude.toFixed(5)}`
            : "No GPS shared"}
        </Text>
      </View>

      <View className="flex-row gap-2">
        {alert.trekker.phone && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${alert.trekker.phone}`)}
            className="flex-1 bg-blue-50 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={14} color="#1d4ed8" />
            <Text className="text-blue-700 text-[12px] font-bold">Call</Text>
          </TouchableOpacity>
        )}
        {alert.latitude != null && alert.longitude != null && (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://maps.google.com/?q=${alert.latitude},${alert.longitude}`,
              )
            }
            className="flex-1 bg-gray-50 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={14} color="#374151" />
            <Text className="text-gray-700 text-[12px] font-bold">Map</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onResolve}
          disabled={resolving}
          className="flex-1 bg-green-600 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
          activeOpacity={0.8}
          style={resolving ? { opacity: 0.6 } : undefined}
        >
          {resolving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text className="text-white text-[12px] font-bold">
                Resolve
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RangerAlerts() {
  const { alerts, loading, refreshing, resolvingId, refetch, resolve } =
    useSosAlerts(8000);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="light" />

      <View className="bg-red-900 px-5 pt-4 pb-6">
        <View className="flex-row items-center gap-2 mb-1">
          <Ionicons name="warning" size={20} color="#fca5a5" />
          <Text className="text-white text-[22px] font-extrabold tracking-tight">
            SOS Alerts
          </Text>
        </View>
        <Text className="text-red-300 text-[12px]">
          {alerts.length} active {alerts.length === 1 ? "alert" : "alerts"}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#dc2626" size="large" />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor="#dc2626"
            />
          }
          renderItem={({ item }) => (
            <AlertCard
              alert={item}
              onResolve={() => resolve(item.id)}
              resolving={resolvingId === item.id}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-24 gap-2">
              <Ionicons name="shield-checkmark" size={40} color="#d1d5db" />
              <Text className="text-gray-400 text-[13px] font-medium">
                No active SOS alerts
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
