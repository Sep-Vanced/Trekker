import { useShimmer } from "@/hooks/useShimmer";
import { Animated, View } from "react-native";

export function SkeletonCard() {
  const opacity = useShimmer();
  return (
    <Animated.View style={{ opacity }} className="mx-4 mb-3">
      <View
        className="bg-white rounded-3xl overflow-hidden"
        style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
      >
        <View className="flex-row">
          <View className="w-1 bg-slate-200" style={{ minHeight: 110 }} />
          <View className="flex-1 p-4">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-11 h-11 rounded-2xl bg-slate-100" />
              <View className="flex-1 gap-2">
                <View className="h-3.5 w-2/3 bg-slate-200 rounded-full" />
                <View className="h-2.5 w-full bg-slate-100 rounded-full" />
              </View>
            </View>
            <View className="flex-row gap-2 mb-3">
              <View className="h-5 w-16 rounded-full bg-slate-100" />
              <View className="h-5 w-12 rounded-full bg-slate-100" />
            </View>
            <View className="h-9 rounded-2xl bg-slate-100" />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}