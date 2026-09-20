import { useShimmer } from "@/hooks/useShimmer";
import { Animated, View } from "react-native";

export function SkeletonCard() {
  const opacity = useShimmer();
  return (
    <Animated.View
      style={{ opacity }}
      className="bg-white rounded-3xl mb-4 overflow-hidden"
    >
      {/* Accent bar */}
      <View className="h-1 bg-slate-200 w-full" />

      <View className="p-4">
        {/* Top row */}
        <View className="flex-row items-start mb-3 gap-3">
          <View className="flex-1 gap-2">
            <View className="h-4 w-3/4 bg-slate-200 rounded-lg" />
            <View className="h-3 w-full bg-slate-100 rounded-md" />
            <View className="h-3 w-2/3 bg-slate-100 rounded-md" />
          </View>
          <View className="w-11 h-11 rounded-[14px] bg-slate-200" />
        </View>

        {/* Pills */}
        <View className="flex-row gap-2 mb-3">
          <View className="h-6 w-20 rounded-full bg-slate-200" />
          <View className="h-6 w-16 rounded-full bg-slate-100" />
        </View>

        {/* Coords */}
        <View className="pb-3 border-b border-slate-50 mb-1">
          <View className="h-3 w-1/2 bg-slate-100 rounded-md" />
        </View>

        {/* Button */}
        <View className="h-12 mt-3 rounded-2xl bg-slate-200" />
      </View>
    </Animated.View>
  );
}