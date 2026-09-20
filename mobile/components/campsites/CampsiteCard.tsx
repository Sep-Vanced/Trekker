import { Campsite } from "@/types/navigation-types";
import { getPhaseConfig } from "@/utils/getPhaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export function CampsiteCard({
  campsite, isActive, onSelect, onFocus,
}: {
  campsite: Campsite; isActive: boolean; onSelect: () => void; onFocus: () => void;
}) {
  const phase = getPhaseConfig(campsite.phase);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(glowAnim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 70, friction: 12,
    }).start();
    if (isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.975, duration: 90, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 10 }),
      ]).start();
    }
  }, [isActive]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0.05)", phase.accent + "50"],
  });
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.2],
  });

  const handlePress = () => { onFocus(); onSelect(); };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginHorizontal: 16, marginBottom: 12 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <Animated.View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor,
            shadowColor: isActive ? phase.accent : "#0f172a",
            shadowOffset: { width: 0, height: isActive ? 6 : 2 },
            shadowOpacity,
            shadowRadius: isActive ? 18 : 8,
            elevation: isActive ? 7 : 2,
            overflow: "hidden",
          }}
        >
          <View className="flex-row">
            {/* Left phase rail */}
            <View style={{ width: 5, backgroundColor: phase.accent }} />

            {/* Card body */}
            <View className="flex-1 p-4">
              {/* Top row */}
              <View className="flex-row items-start gap-3 mb-3">
                {/* Phase icon badge */}
                <View
                  style={{
                    width: 46, height: 46, borderRadius: 16,
                    backgroundColor: isActive ? phase.accent : phase.accentAlpha,
                    alignItems: "center", justifyContent: "center",
                    shadowColor: phase.accent,
                    shadowOpacity: isActive ? 0.4 : 0,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: isActive ? 3 : 0,
                  }}
                >
                  <Ionicons name="bonfire" size={21} color={isActive ? "white" : phase.accent} />
                </View>

                {/* Name + description */}
                <View className="flex-1">
                  <Text
                    className="text-[14px] font-extrabold text-[#0a1a0a] tracking-tight leading-[19px]"
                    numberOfLines={1}
                  >
                    {campsite.name}
                  </Text>
                  <Text
                    className="text-[11px] text-[rgba(10,26,10,0.45)] mt-0.5 leading-4"
                    numberOfLines={2}
                  >
                    {campsite.description}
                  </Text>
                </View>

                {/* Locate button */}
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation?.(); onFocus(); }}
                  style={{
                    backgroundColor: isActive ? phase.accent + "18" : "rgba(0,0,0,0.04)",
                    borderColor: isActive ? phase.accent + "35" : "rgba(0,0,0,0.07)",
                  }}
                  className="w-8 h-8 rounded-full items-center justify-center border"
                >
                  <Ionicons
                    name={isActive ? "locate" : "locate-outline"}
                    size={13}
                    color={isActive ? phase.accent : "rgba(10,26,10,0.3)"}
                  />
                </TouchableOpacity>
              </View>

              {/* Meta row */}
              <View className="flex-row items-center mb-3 flex-wrap">
                {/* Phase pill */}
                <View
                  style={{ backgroundColor: phase.accent + "15", borderColor: phase.accent + "25" }}
                  className="flex-row items-center px-2.5 py-1 rounded-full border"
                >
                  <Ionicons name={phase.icon} size={9} color={phase.accent} />
                  <Text style={{ color: phase.accent }} className="text-[10px] font-bold ml-1">
                    {campsite.phase}
                  </Text>
                </View>

                {/* Active pill */}
                <View className="flex-row items-center px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] ml-2">
                  <View className="w-[5px] h-[5px] rounded-full bg-green-500" />
                  <Text className="text-[10px] font-bold text-green-700 ml-1">Active</Text>
                </View>

                {/* Coordinates */}
                <View className="flex-row items-center gap-1 ml-auto">
                  <Ionicons name="navigate-outline" size={10} color="rgba(10,26,10,0.3)" />
                  <Text className="text-[10px] font-medium text-[rgba(10,26,10,0.35)]">
                    {parseFloat(campsite.latitude).toFixed(4)}°, {parseFloat(campsite.longitude).toFixed(4)}°
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-black/5 mb-3" />

              {/* CTA button */}
              <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.82}
                style={{
                  backgroundColor: phase.accent,
                  borderRadius: 16,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  shadowColor: phase.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.32,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <Ionicons name="trail-sign" size={14} color="white" />
                <Text className="text-white text-[13px] font-extrabold tracking-[0.2px]">
                  View Routes
                </Text>
                <View className="bg-white/[0.18] rounded-[10px] px-[7px] py-[3px]">
                  <Ionicons name="arrow-forward" size={11} color="rgba(255,255,255,0.9)" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}