import { Text, View } from "react-native";

export function LegendDot({ phase, color }: { phase: string; color: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ backgroundColor: color, width: 8, height: 8, borderRadius: 4 }} />
      <Text style={{ color: "rgba(15,31,15,0.65)", fontSize: 9, fontWeight: "600" }}>{phase}</Text>
    </View>
  );
}