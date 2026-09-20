import { View, Text, TouchableOpacity } from "react-native";
import { Camp } from "../data/staticData";

type Props = {
  camp: Camp;
  onPress?: () => void;
};

const difficultyColor: Record<string, string> = {
  Easy: "text-green-600",
  Moderate: "text-blue-600",
  Hard: "text-orange-600",
  Expert: "text-red-600",
};

export default function CampCard({ camp, onPress }: Props) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: camp.color + "22" }}
        >
          <Text className="text-3xl">🏕️</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-bold">{camp.name}</Text>
          <View className="flex-row items-center gap-3 mt-1">
            <Text className={`text-xs font-semibold ${difficultyColor[camp.difficulty]}`}>
              {camp.difficulty}
            </Text>
            <Text className="text-gray-400 text-xs">📏 {camp.distance}km</Text>
            <Text className="text-gray-400 text-xs">⏱️ {camp.estimatedTime}</Text>
          </View>
        </View>
        <Text className="text-gray-300 text-xl">›</Text>
      </View>
    </TouchableOpacity>
  );
}