import { useShimmer } from "@/hooks/useShimmer";
import { Ionicons } from "@expo/vector-icons";
import { Animated, Text, View } from "react-native";

export function MapSkeleton() {
  const opacity = useShimmer();
  return (
    <View className="flex-1 bg-[#e4ede4] items-center justify-center gap-3">
      <Animated.View style={{ opacity }} className="items-center gap-2">
        <View className="w-14 h-14 rounded-full bg-black/[0.06] items-center justify-center">
          <Ionicons name="map-outline" size={26} color="rgba(0,0,0,0.2)" />
        </View>
        <Text className="text-[11px] font-semibold text-black/25 tracking-wide">
          Loading map…
        </Text>
      </Animated.View>
    </View>
  );
}