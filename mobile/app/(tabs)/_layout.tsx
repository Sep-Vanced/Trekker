import { Tabs } from "expo-router";
import { View, Text, Platform } from "react-native";
import Svg, { Path, Line, Polyline, Polygon, Circle } from "react-native-svg";

type TabName = "home" | "routes" | "dashboard" | "profile";

const ACTIVE_COLOR = "#1a7a40";
const INACTIVE_COLOR = "#94a3b8";
const ACTIVE_BG = "#eaf4ee";

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <Line x1="9" y1="3" x2="9" y2="18" />
      <Line x1="15" y1="6" x2="15" y2="21" />
    </Svg>
  );
}

function StatsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="18" y1="20" x2="18" y2="10" />
      <Line x1="12" y1="20" x2="12" y2="4" />
      <Line x1="6" y1="20" x2="6" y2="14" />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

function TrekLineIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 18l4-8 4 4 4-6 4 10" />
    </Svg>
  );
}

// ─── Tab icon component ───────────────────────────────────────────────────────
const TAB_CONFIG: Record<TabName, { Icon: React.FC<{ color: string }>; label: string }> = {
  home:      { Icon: HomeIcon,    label: "Home"     },
  routes:    { Icon: MapIcon,     label: "Campsite" },
  dashboard: { Icon: StatsIcon,   label: "Stats"    },
  profile:   { Icon: ProfileIcon, label: "Profile"  },
};

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  const { Icon, label } = TAB_CONFIG[name];
  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
  return (
    <View style={{ alignItems: "center", gap: 3, width: 60 }}>
      <View style={{
        width: 45, height: 40, borderRadius: 12,
        alignItems: "center", justifyContent: "center",
        backgroundColor: focused ? ACTIVE_BG : "transparent",
      }}>
        <Icon color={color} />
      </View>
      <Text style={{
        fontSize: 11, letterSpacing: 0.5,
        color,
        fontWeight: focused ? "700" : "500",
      }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Trek FAB ─────────────────────────────────────────────────────────────────
function TrekIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 3, marginTop: -24 }}>
      {/* Ambient glow ring */}
      {focused && (
        <View style={{
          position: "absolute",
          width: 66, height: 66,
          borderRadius: 20,
          backgroundColor: "#22c55e",
          opacity: 0.15,
          top: -5,
        }} />
      )}
      <View style={{
        width: 58, height: 58, borderRadius: 18,
        alignItems: "center", justifyContent: "center",
        backgroundColor: focused ? "#1f8645" : "#22913f",
        borderWidth: 2,
        borderColor: focused ? "#4ade8055" : "#22c55e44",
        shadowColor: "#166534",
        shadowOffset: { width: 0, height: focused ? 8 : 6 },
        shadowOpacity: focused ? 0.45 : 0.3,
        shadowRadius: focused ? 16 : 12,
        elevation: 12,
      }}>
        <TrekLineIcon />
      </View>
      <Text style={{
        fontSize: 11, letterSpacing: 0.1,
        color: ACTIVE_COLOR, fontWeight: "600",
      }}>
        Travel
      </Text>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "relative",
          height: 72,
          borderRadius: 24,
          borderTopWidth: 0,
          backgroundColor: "#FFFFFF",
          elevation: 12,
          shadowColor: "#0f2814",
          shadowOpacity: 0.12,
          shadowRadius: 20,
          // Thin green-tinted border
          borderWidth: 0.5,
          borderColor: "#e2ede6",
          paddingBottom: 0,
          paddingTop: 15,
          margin: Platform.OS === "android" ? 5 : 10,
        },
      }}
    >
      <Tabs.Screen name="home"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="routes"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="routes" focused={focused} /> }} />
      <Tabs.Screen name="trek"
        options={{ tabBarIcon: ({ focused }) => <TrekIcon focused={focused} /> }} />
      <Tabs.Screen name="dashboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} /> }} />
      <Tabs.Screen name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}