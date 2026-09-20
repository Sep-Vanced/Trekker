import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { EMERGENCY_CONTACTS } from "../../data/staticData";
import { useAuth } from "../../constants/AuthContext";
import { useTrek } from "../../constants/TrekContext";
import { sendSos } from "@/api/emergency";
import {
  ChevronLeft,
  Siren,
  Phone,
  PhoneCall,
  User,
  AlertTriangle,
} from "lucide-react-native";

export default function Emergency() {
  const router = useRouter();
  const { user } = useAuth();
  const { session } = useTrek();
  const [sosLoading, setSosLoading] = useState(false);
  const [lastSosAt, setLastSosAt] = useState<Date | null>(null);

  const getCoordinates = async (): Promise<{
    lat: number | null;
    lng: number | null;
  }> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return { lat: null, lng: null };

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          return {
            lat: lastKnown.coords.latitude,
            lng: lastKnown.coords.longitude,
          };
        }
      } catch {}
      return { lat: null, lng: null };
    }
  };

  const handleSOS = () => {
    Alert.alert(
      "Send SOS Signal?",
      "This will alert local rangers with your GPS coordinates. Only use in genuine emergencies.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: async () => {
            setSosLoading(true);
            try {
              const { lat, lng } = await getCoordinates();
              await sendSos({
                latitude: lat,
                longitude: lng,
                message: session
                  ? `SOS triggered near ${session.camp.name}`
                  : "SOS activated from Emergency Center",
              });
              setLastSosAt(new Date());
              Alert.alert(
                "SOS Sent",
                "Emergency signal sent to local rangers. Stay calm and stay in place. Help is on the way.",
                [{ text: "OK" }],
              );
            } catch (err) {
              console.log("SOS send error:", err);
              Alert.alert(
                "SOS Failed to Send",
                "We couldn't reach the server. Please check your connection and try again, or call the hotline below directly.",
                [{ text: "OK" }],
              );
            } finally {
              setSosLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleCall = (number: string, name: string) => {
    Alert.alert(`Call ${name}?`, number, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call Now",
        onPress: () =>
          Linking.openURL(`tel:${number}`).catch(() =>
            Alert.alert("Cannot place call on this device."),
          ),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <View className="bg-red-600 px-5 py-5 mx-3 rounded-3xl">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-5 self-start"
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color="#fca5a5" strokeWidth={2.5} />
            <Text className="text-red-200 text-sm ml-0.5">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-end justify-between">
            <View>
              <View className="flex-row items-center gap-2 mb-1">
                <Siren size={20} color="#fff" strokeWidth={1.8} />
                <Text className="text-white text-2xl font-bold tracking-tight">
                  Emergency Center
                </Text>
              </View>
              <Text className="text-red-200 text-sm">
                SOS & Emergency Contacts
              </Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-4">
          {/* ── SOS BUTTON ────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleSOS}
            disabled={sosLoading}
            activeOpacity={0.85}
            className="bg-red-600 rounded-3xl py-8 items-center mb-3 border-2 border-red-500 shadow-sm"
            style={sosLoading ? { opacity: 0.7 } : undefined}
          >
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-3">
              {sosLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Siren size={34} color="#fff" strokeWidth={1.8} />
              )}
            </View>
            <Text className="text-white text-2xl font-bold tracking-widest">
              {sosLoading ? "SENDING…" : "SEND SOS"}
            </Text>
            <Text className="text-red-200 text-xs mt-1.5 text-center px-8">
              Sends GPS coordinates to local rangers
            </Text>
          </TouchableOpacity>

          {lastSosAt && (
            <View className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-5 flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-green-700 text-xs font-semibold">
                Last SOS sent at {lastSosAt.toLocaleTimeString()}
              </Text>
            </View>
          )}

          {/* ── EMERGENCY CONTACTS ───────────────────────────────── */}
          <View className="flex-row items-center gap-2 mb-3">
            <PhoneCall size={14} color="#374151" strokeWidth={2} />
            <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest">
              Emergency Contacts
            </Text>
          </View>

          <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-5">
            {EMERGENCY_CONTACTS.map((contact, idx) => (
              <TouchableOpacity
                key={contact.name}
                onPress={() => handleCall(contact.number, contact.name)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-4 ${
                  idx < EMERGENCY_CONTACTS.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="w-11 h-11 bg-red-50 rounded-2xl items-center justify-center mr-3 border border-red-100">
                  <Phone size={18} color="#dc2626" strokeWidth={1.8} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-bold">
                    {contact.name}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {contact.role}
                  </Text>
                  <Text className="text-red-500 text-xs font-semibold font-mono mt-0.5">
                    {contact.number}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(contact.number, contact.name)}
                  className="bg-red-500 rounded-xl px-3.5 py-2 flex-row items-center"
                  activeOpacity={0.8}
                >
                  <Phone size={12} color="#fff" strokeWidth={2.5} />
                  <Text className="text-white text-xs font-bold ml-1.5">
                    Call
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── PERSONAL EMERGENCY CONTACT ───────────────────────── */}
          {user?.emergency_contact_phone && (
            <>
              <View className="flex-row items-center gap-2 mb-3">
                <User size={14} color="#374151" strokeWidth={2} />
                <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest">
                  Your Emergency Contact
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  handleCall(
                    user.emergency_contact_phone,
                    user.emergency_contact_name,
                  )
                }
                activeOpacity={0.7}
                className="bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm mb-5"
              >
                <View className="flex-row items-center">
                  <View className="w-11 h-11 bg-green-50 rounded-2xl items-center justify-center mr-3 border border-green-100">
                    <User size={18} color="#16a34a" strokeWidth={1.8} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-0.5">
                      <Text className="text-gray-900 text-sm font-bold">
                        {user.emergency_contact_name}
                      </Text>
                      <View className="bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                        <Text className="text-green-700 text-xs font-semibold">
                          Personal
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-400 text-xs">
                      Emergency contact on file
                    </Text>
                    <Text className="text-green-600 text-xs font-semibold font-mono mt-0.5">
                      {user.emergency_contact_phone}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* ── SAFETY REMINDER ──────────────────────────────────── */}
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 bg-amber-100 rounded-xl items-center justify-center">
                <AlertTriangle size={14} color="#d97706" strokeWidth={2} />
              </View>
              <Text className="text-amber-800 text-sm font-bold">
                Safety Reminder
              </Text>
            </View>
            {[
              "Stay calm and stay in one place.",
              "Send your SOS and GPS coordinates immediately.",
              "Do not attempt to navigate dangerous terrain alone.",
              "Wait for rescue teams — they will reach you.",
            ].map((tip, i) => (
              <View key={i} className="flex-row items-start gap-2 mb-1.5">
                <Text className="text-amber-400 text-xs mt-0.5 leading-5">
                  •
                </Text>
                <Text className="text-amber-700 text-xs leading-5 flex-1">
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}