import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/constants/AuthContext";

type Icon = React.ComponentProps<typeof Ionicons>["name"];

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-100">
      <View className="w-8 h-8 rounded-xl items-center justify-center bg-green-100">
        <Ionicons name={icon} size={14} color="#16a34a" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </Text>
        <Text className="text-gray-800 text-[13px] font-semibold mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

export default function RangerProfile() {
  const { user, signOut } = useAuth();

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "R";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-5 pb-8 bg-green-900 items-center">
          {/* Avatar */}
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(76,222,128,0.15)" }}
          >
            <Text className="text-[#4cde80] text-3xl font-extrabold">{initials}</Text>
          </View>
          <Text className="text-white text-xl font-extrabold tracking-tight">
            {user?.first_name} {user?.last_name}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-2">
            <View className="w-2 h-2 rounded-full bg-[#4cde80]" />
            <Text className="text-[#4cde80] text-[12px] font-semibold capitalize">
              {user?.role ?? "Ranger"}
            </Text>
          </View>
        </View>

        <View className="px-5 pt-4 pb-28 bg-gray-50">
          {/* Info section */}
          <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2">
            Personal Info
          </Text>
          <View className="rounded-2xl px-4 bg-white border border-gray-100">
            <InfoRow icon="person-outline" label="Username" value={user?.username ?? "—"} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email ?? "—"} />
            <InfoRow icon="call-outline" label="Phone" value={user?.phone ?? "—"} />
          </View>

          {/* Emergency contact */}
          {/* <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mt-6 mb-2">
            Emergency Contact
          </Text>
          <View className="rounded-2xl px-4 bg-white border border-gray-100">
            <InfoRow
              icon="person-add-outline"
              label="Contact Name"
              value={user?.emergency_contact_name ?? "—"}
            />
            <InfoRow
              icon="call-outline"
              label="Contact Phone"
              value={user?.emergency_contact_phone ?? "—"}
            />
          </View> */}

          {/* Sign out */}
          <TouchableOpacity
            onPress={signOut}
            className="mt-8 flex-row items-center justify-center rounded-xl py-3 bg-red-100"
            style={{
              borderWidth: 1,
              borderColor: "rgba(248,113,113,0.3)",
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#f87171" />
            <Text className="text-red-400 text-[14px] font-bold mx-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}