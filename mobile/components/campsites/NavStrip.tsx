import { Campsite } from "@/types/navigation-types";
import { getPhaseConfig } from "@/utils/getPhaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function NavStrip({
  campsite, total, activeIndex, onPrev, onNext, mapVisible, onToggleMap,
}: {
  campsite: Campsite | null; total: number; activeIndex: number;
  onPrev: () => void; onNext: () => void;
  mapVisible: boolean; onToggleMap: () => void;
}) {
  if (!campsite) return null;
  const phase = getPhaseConfig(campsite.phase);
  const progress = total > 1 ? activeIndex / (total - 1) : 1;

  return (
    <View className="bg-white border-t border-black/[0.06]">
      <View className="flex-row">
        {/* Left phase rail */}
        {/* <View style={{ width: 3, backgroundColor: phase.accent }} /> */}

        <View className="flex-1 flex-row items-center gap-2.5 px-[14px] py-2.5">
          {/* Prev */}
          <TouchableOpacity
            onPress={onPrev}
            disabled={activeIndex === 0}
            className="w-[30px] h-[30px] rounded-lg items-center justify-center border border-black/[0.08]"
            style={{ backgroundColor: activeIndex > 0 ? "transparent" : "rgba(0,0,0,0.02)" }}
          >
            <Ionicons
              name="chevron-back"
              size={15}
              color={activeIndex > 0 ? "#0a1a0a" : "rgba(10,26,10,0.25)"}
            />
          </TouchableOpacity>

          {/* Center content */}
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="flex-1 min-w-0">
              <Text
                className="text-[13px] font-semibold text-[#0a1a0a] leading-[18px]"
                numberOfLines={1}
              >
                {campsite.name}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-[3px]">
                <View
                  style={{ backgroundColor: phase.accent + "18" }}
                  className="px-[7px] py-[2px] rounded-full"
                >
                  <Text style={{ color: phase.accent }} className="text-[10px] font-semibold">
                    {campsite.phase}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress + step counter */}
            <View className="flex-row items-center gap-2 shrink-0">
              <Text className="text-[11px] text-[rgba(10,26,10,0.4)] tabular-nums">
                {activeIndex + 1} / {total}
              </Text>
              <View className="w-12 h-1 bg-black/[0.07] rounded-full overflow-hidden">
                <View
                  style={{ width: `${progress * 100}%`, backgroundColor: phase.accent }}
                  className="h-full rounded-full"
                />
              </View>
            </View>
          </View>

          {/* Map toggle */}
          <TouchableOpacity
            onPress={onToggleMap}
            className="flex-row items-center px-[10px] py-[5px] rounded-lg border border-black/[0.08]"
            style={{ backgroundColor: mapVisible ? "rgba(0,0,0,0.03)" : phase.accent + "12" }}
          >
            <Ionicons
              name={mapVisible ? "map" : "map-outline"}
              size={12}
              color={mapVisible ? "rgba(10,26,10,0.45)" : phase.accent}
            />
            <Text
              style={{ color: mapVisible ? "rgba(10,26,10,0.45)" : phase.accent }}
              className="text-[11px] font-semibold ml-1"
            >
              {mapVisible ? "Hide map" : "Show map"}
            </Text>
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            onPress={onNext}
            disabled={activeIndex === total - 1}
            className="w-[30px] h-[30px] rounded-lg items-center justify-center border border-black/[0.08]"
            style={{ backgroundColor: activeIndex < total - 1 ? "transparent" : "rgba(0,0,0,0.02)" }}
          >
            <Ionicons
              name="chevron-forward"
              size={15}
              color={activeIndex < total - 1 ? "#0a1a0a" : "rgba(10,26,10,0.25)"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}