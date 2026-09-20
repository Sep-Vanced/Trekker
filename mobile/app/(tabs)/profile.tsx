import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../constants/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: IoniconName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-slate-50">
      <View className="w-8 h-8 rounded-xl bg-slate-100 items-center justify-center">
        <Ionicons name={icon} size={14} color="#64748b" />
      </View>
      <Text className="text-slate-400 text-sm flex-1">{label}</Text>
      <Text className="text-slate-800 text-sm font-semibold">{value}</Text>
    </View>
  );
}

// ─── Menu item ────────────────────────────────────────────────────────────────
function MenuItem({
  icon,
  label,
  onPress,
  danger,
  iconBg,
  iconColor,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 px-4 py-3.5 border-b border-slate-50"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: danger ? "#fee2e2" : iconBg ?? "#f1f5f9" }}
      >
        <Ionicons
          name={icon}
          size={16}
          color={danger ? "#ef4444" : iconColor ?? "#64748b"}
        />
      </View>
      <Text
        className={`flex-1 text-sm font-semibold ${
          danger ? "text-red-500" : "text-slate-800"
        }`}
      >
        {label}
      </Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon, label }: { icon: IoniconName; label: string }) {
  return (
    <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
      <Ionicons name={icon} size={13} color="#94a3b8" />
      <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
        {label}
      </Text>
    </View>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function ProfileStat({
  icon,
  value,
  label,
}: {
  icon: IoniconName;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center gap-1">
      <View className="w-9 h-9 rounded-xl bg-white/15 items-center justify-center mb-0.5">
        <Ionicons name={icon} size={16} color="rgba(255,255,255,0.9)" />
      </View>
      <Text className="text-white text-sm font-bold">{value}</Text>
      <Text className="text-forest-300 text-[10px] font-medium">{label}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <View
          className="bg-green-900 px-5 pt-6 pb-8 items-center"
          style={{
            shadowColor: "#0f5229",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Avatar */}
          <View className="relative mb-4">
            <View
              className="w-24 h-24 rounded-3xl bg-forest-600 items-center justify-center"
              style={{
                shadowColor: "#0f5229",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="text-white text-4xl font-bold">{initial}</Text>
            </View>
            {/* Online indicator */}
            <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-forest-800" />
          </View>

          <Text className="text-white text-xl font-bold">{user?.username}</Text>
          <Text className="text-forest-300 text-sm mt-0.5">{user?.email}</Text>

          {/* Role badge */}
          <View className="flex-row items-center mt-3 bg-white/10 px-4 py-1.5 rounded-full">
            <Ionicons name="shield-checkmark" size={13} color="#a8e6b8" />
            <Text className="text-forest-200 text-xs font-semibold ml-1.5">
              Registered User
            </Text>
          </View>

          {/* Stats row */}
          <View className="flex-row mt-5 pt-3 border-t border-white/10 w-full justify-center">
            <ProfileStat icon="trail-sign" value="35"     label="Travel"    />
            <View className="w-px bg-white/10" />
            <ProfileStat icon="walk"        value="N/A km"  label="Distance" />
            <View className="w-px bg-white/10" />
            <ProfileStat icon="star"        value="N/A "   label="Rating"   />
          </View>
        </View>

        <View className="px-5 pt-4 pb-28 gap-4">

          {/* ── Personal info ─────────────────────────────────────────────── */}
          <View
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <SectionHeading icon="person" label="Personal Information" />
            <View className="px-4 pb-2">
              <InfoRow icon="person-circle" label="Full Name"   value={user?.username ?? "-"}         />
              <InfoRow icon="mail"          label="Email"       value={user?.email ?? "-"}        />
              <InfoRow icon="call"          label="Phone"       value={user?.phone ?? "-"}        />
            </View>
          </View>

          {/* ── Emergency contact ─────────────────────────────────────────── */}
          <View
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <SectionHeading icon="warning" label="Emergency Contact" />
            <View className="px-4 pb-2">
              <InfoRow icon="person"  label="Contact Name"   value={user?.emergency_contact_name || "Not set"} />
              <InfoRow icon="phone-portrait" label="Contact Number" value={user?.emergency_contact_phone || "Not set"} />
            </View>
          </View>

          {/* ── Menu ──────────────────────────────────────────────────────── */}
          <View
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <SectionHeading icon="grid" label="Menu" />
            <View className="" pointerEvents="none" style={{ opacity: 0.4 }}>
              <MenuItem
                icon="footsteps"
                label="My Travel History"
                iconBg="#dcfce7"
                iconColor="#16a34a"
                onPress={() => {}}
              />
              <MenuItem
                icon="call"
                label="Emergency Contacts"
                iconBg="#fee2e2"
                iconColor="#dc2626"
                onPress={() => router.push("/screens/emergency")}
              />
              <MenuItem
                icon="settings"
                label="App Settings"
                iconBg="#f1f5f9"
                iconColor="#475569"
                onPress={() => {}}
              />
              <MenuItem
                icon="information-circle"
                label="About Mapanuepe Trail"
                iconBg="#dbeafe"
                iconColor="#2563eb"
                onPress={() => {}}
              />
            </View>

            <MenuItem
              icon="log-out"
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>

          {/* ── Version footer ────────────────────────────────────────────── */}
          <View className="items-center gap-1 py-2">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="leaf" size={12} color="#94a3b8" />
              <Text className="text-slate-400 text-xs font-medium">
                Mapanuepe Trail v1.0.0
              </Text>
            </View>
            <Text className="text-slate-300 text-[11px]">
              San Marcelino, Zambales
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}