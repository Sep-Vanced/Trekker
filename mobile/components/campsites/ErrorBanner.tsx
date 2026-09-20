import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="m-4 rounded-[18px] p-[14px] bg-red-500/[0.08] border border-red-500/20 flex-row items-center gap-2.5">
      <View className="w-8 h-8 rounded-full bg-red-500/[0.12] items-center justify-center">
        <Ionicons name="alert-circle" size={16} color="#ef4444" />
      </View>
      <Text className="flex-1 text-xs text-red-600 font-medium">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="px-3 py-1.5 rounded-[10px] bg-red-500/[0.12] border border-red-500/20"
      >
        <Text className="text-[11px] text-red-500 font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
