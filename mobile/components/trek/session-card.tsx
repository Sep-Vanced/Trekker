import { TrekkingSession } from "@/types/trekking-types";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function SessionCard({
  session,
  onEnd,
  onPress,
}: {
  session: TrekkingSession;
  index: number;
  onEnd: () => void;
  onPress: () => void;
}) {
  const startedAt = new Date(session.started_at);
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 60000);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="bg-white rounded-2xl mb-3 overflow-hidden border border-slate-100"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Active stripe */}
      {session.is_active && <View className="h-1 bg-emerald-500 w-full" />}

      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                session.is_active ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              <Ionicons
                name={session.is_active ? "navigate" : "checkmark"}
                size={15}
                color={session.is_active ? "#15803d" : "#64748b"}
              />
            </View>
            <View>
              <Text className="text-xs font-extrabold text-slate-800">
                Session #{session.id}
              </Text>
              <Text className="text-[10px] text-slate-400">
                Route {session.route}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full ${
                session.is_active ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full ${
                  session.is_active ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              <Text
                className={`text-[10px] font-bold ml-1.5 ${
                  session.is_active ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {session.is_active ? "Active" : "Ended"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5px]">
              Started
            </Text>
            <Text className="text-xs text-slate-700 font-bold mt-0.5">
              {formatTime(startedAt)}
            </Text>
            <Text className="text-[10px] text-slate-400">
              {formatDate(startedAt)}
            </Text>
          </View>
          {session.is_active && (
            <View className="flex-1 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
              <Text className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.5px]">
                Elapsed
              </Text>
              <Text className="text-xs text-emerald-800 font-bold mt-0.5">
                {elapsed} min
              </Text>
              <Text className="text-[10px] text-emerald-500">since start</Text>
            </View>
          )}
          {session.ended_at && !session.is_active && (
            <View className="flex-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.5px]">
                Ended
              </Text>
              <Text className="text-xs text-slate-700 font-bold mt-0.5">
                {formatTime(new Date(session.ended_at))}
              </Text>
              <Text className="text-[10px] text-slate-400">
                {formatDate(new Date(session.ended_at))}
              </Text>
            </View>
          )}
        </View>

        {/* End button — stop propagation so it doesn't trigger card tap */}
        {session.is_active && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              onEnd();
            }}
            activeOpacity={0.82}
            className="flex-row items-center justify-center bg-red-50 border border-red-200 rounded-xl py-2"
          >
            <Ionicons name="stop-circle" size={15} color="#dc2626" />
            <Text className="text-red-600 text-xs font-bold mx-2">
              End This Session
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}