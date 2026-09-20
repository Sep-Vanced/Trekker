import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function EmptyState({ onStartRoute }: { onStartRoute: () => void }) {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-20 h-20 rounded-[24px] bg-emerald-50 border border-emerald-100 items-center justify-center mb-4">
        <Text className="text-4xl">🧭</Text>
      </View>
      <Text className="text-slate-800 text-xl font-bold text-center mb-2">
        No Active Trek
      </Text>
      <Text className="text-slate-400 text-sm text-center mb-8 leading-6">
        Choose a route and complete registration to begin your trekking session.
      </Text>
      <TouchableOpacity
        onPress={onStartRoute}
        className="bg-forest-700 rounded-2xl px-8 py-4 flex-row items-center gap-2"
        style={{
          shadowColor: "#15803d",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Ionicons name="trail-sign" size={16} color="white" />
        <Text className="text-white font-bold text-base">Choose a Route</Text>
      </TouchableOpacity>
    </View>
  );
}