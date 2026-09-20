import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CAMPS, CHECKPOINTS, DASHBOARD_STATS } from "../../data/staticData";

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Moderate: "bg-blue-100 text-blue-700",
  Hard: "bg-orange-100 text-orange-700",
  Expert: "bg-red-100 text-red-700",
};

const checkpointTypeIcon: Record<string, string> = {
  start: "🚩",
  waypoint: "📍",
  danger: "⚠️",
  river: "🌊",
  camp: "🏕️",
};

export default function CampDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const camp = CAMPS.find((c) => c.id === id);
  const checkpoints = CHECKPOINTS.filter((c) => c.campId === id);
  const routeStatus = id ? DASHBOARD_STATS.routeStatus[id] : "Unknown";

  if (!camp) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Camp not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-forest-700 font-semibold">← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View
          className="h-52 items-center justify-center"
          style={{ backgroundColor: camp.color + "33" }}
        >
          <Text className="text-8xl">🏕️</Text>
        </View>

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-5 bg-black/30 w-10 h-10 rounded-full items-center justify-center"
        >
          <Text className="text-white text-lg">‹</Text>
        </TouchableOpacity>

        <View className="px-5 pt-5">
          {/* Title & Status */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-gray-900 text-2xl font-bold">{camp.name}</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {camp.distance} km from trailhead
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full ${
                routeStatus === "Open"
                  ? "bg-green-100"
                  : routeStatus === "Caution"
                  ? "bg-amber-100"
                  : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  routeStatus === "Open"
                    ? "text-green-700"
                    : routeStatus === "Caution"
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >
                {routeStatus === "Open" ? "✅" : routeStatus === "Caution" ? "⚠️" : "🚫"} {routeStatus}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 text-sm leading-6 mb-5">{camp.description}</Text>

          {/* Stats Row */}
          <View className="flex-row bg-white rounded-2xl overflow-hidden shadow-sm mb-5">
            {[
              { icon: "📏", label: "Distance", value: `${camp.distance} km` },
              { icon: "⏱️", label: "Duration", value: camp.estimatedTime },
              { icon: "⛰️", label: "Elevation", value: `+${camp.elevationGain}m` },
            ].map((s, i) => (
              <View
                key={s.label}
                className={`flex-1 py-4 items-center ${i < 2 ? "border-r border-gray-100" : ""}`}
              >
                <Text className="text-xl mb-1">{s.icon}</Text>
                <Text className="text-gray-800 text-sm font-bold">{s.value}</Text>
                <Text className="text-gray-400 text-xs">{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Difficulty */}
          <View className="flex-row items-center mb-5">
            <Text className="text-gray-700 text-sm font-semibold mr-3">Difficulty:</Text>
            <View className={`px-4 py-1.5 rounded-full ${difficultyColor[camp.difficulty]}`}>
              <Text className="text-sm font-bold">{camp.difficulty}</Text>
            </View>
          </View>

          {/* Amenities */}
          <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest mb-3">
            🏕️ Amenities
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {camp.amenities.map((a) => (
              <View key={a} className="bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-full">
                <Text className="text-forest-700 text-xs font-semibold">{a}</Text>
              </View>
            ))}
          </View>

          {/* Route Checkpoints */}
          <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest mb-3">
            📍 Route Checkpoints
          </Text>
          <View className="mb-5">
            {checkpoints.map((cp, idx) => (
              <View key={cp.id} className="flex-row">
                {/* Timeline */}
                <View className="items-center mr-4">
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: camp.color + "33" }}
                  >
                    <Text className="text-base">{checkpointTypeIcon[cp.type]}</Text>
                  </View>
                  {idx < checkpoints.length - 1 && (
                    <View className="w-0.5 flex-1 bg-gray-200 my-1" style={{ minHeight: 24 }} />
                  )}
                </View>
                {/* Content */}
                <View className="flex-1 pb-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-800 text-sm font-bold">{cp.name}</Text>
                    <Text className="text-gray-400 text-xs">{cp.distanceFromStart} km</Text>
                  </View>
                  <Text className="text-gray-500 text-xs mt-0.5">{cp.description}</Text>
                  {cp.alert && (
                    <View className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-2">
                      <Text className="text-amber-700 text-xs">{cp.alert}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            className="bg-forest-700 rounded-2xl py-4 items-center mb-3 shadow-sm"
            onPress={() => router.push(`/screens/trek-start?campId=${camp.id}`)}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-bold"> Start Travel to {camp.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-50 border border-blue-200 rounded-2xl py-3.5 items-center mb-8"
            onPress={() => router.push("/screens/vehicle-check")}
          >
            <Text className="text-blue-700 text-sm font-bold">🚗 Check Vehicle Suitability</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}