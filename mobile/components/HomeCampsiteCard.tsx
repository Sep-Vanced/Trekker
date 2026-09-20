import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Campsite } from "@/types/navigation-types";
import { PHASE_CONFIG } from "@/utils/phase-config";

interface Props {
  campsite: Campsite;
  onPress: () => void;
}

export function HomeCampsiteCard({ campsite, onPress }: Props) {
  const phase = PHASE_CONFIG[campsite.phase];
  const phaseColor = phase?.mapColor ?? "#1f8645";
  const phaseLabel = phase?.label ?? campsite.phase;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-row items-center bg-white rounded-2xl py-3.5 px-3.5 mb-2.5 border border-[#f1f5f1]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Phase icon */}
      <View
        className="w-11 h-11 rounded-[13px] items-center justify-center mr-3"
        style={{
          backgroundColor: `${phaseColor}18`,
          borderWidth: 1.5,
          borderColor: `${phaseColor}30`,
        }}
      >
        <Ionicons name="bonfire" size={20} color={phaseColor} />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-sm font-bold text-[#1a2e1a] mb-0.5" numberOfLines={1}>
          {campsite.name}
        </Text>

        {campsite.description != null && (
          <View className="flex-row items-center gap-1 mb-1">
            <Ionicons name="trending-up" size={11} color="#94a3b8" />
            <Text className="text-[10px] text-slate-400 font-semibold">
              {campsite.description}m
            </Text>
          </View>
        )}

        {/* Phase badge */}
        <View className="flex-row items-center">
          <View
            className="px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: `${phaseColor}18` }}
          >
            <Text className="text-[10px] font-bold" style={{ color: phaseColor }}>
              {phaseLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );
}