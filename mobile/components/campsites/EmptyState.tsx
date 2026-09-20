import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function EmptyState() {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-16 h-16 rounded-[20px] bg-black/[0.04] border border-black/[0.07] items-center justify-center mb-3">
        <Ionicons name="bonfire-outline" size={28} color="rgba(0,0,0,0.2)" />
      </View>
      <Text className="text-[15px] font-bold text-black/35">No campsites found</Text>
      <Text className="text-xs text-black/20 mt-1 text-center">Check back later</Text>
    </View>
  );
}