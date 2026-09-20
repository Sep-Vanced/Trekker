import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  getRegistrationByPermit,
  regenerateQrCode,
  RegistrationDetailType,
} from "@/api/trekking";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  registered: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "#22c55e" },
  completed:  { bg: "bg-slate-100",   text: "text-slate-600",   dot: "#94a3b8" },
  cancelled:  { bg: "bg-red-100",     text: "text-red-700",     dot: "#ef4444" },
  overdue:    { bg: "bg-amber-100",   text: "text-amber-700",   dot: "#f59e0b" },
};

const DIFFICULTY_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  easy:   { bg: "bg-emerald-100", text: "text-emerald-700", label: "Easy"   },
  medium: { bg: "bg-amber-100",   text: "text-amber-700",   label: "Medium" },
  hard:   { bg: "bg-orange-100",  text: "text-orange-700",  label: "Hard"   },
  expert: { bg: "bg-red-100",     text: "text-red-700",     label: "Expert" },
};

// ─── Info row ──────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-start gap-3 py-3 border-b border-slate-50">
      <View className="w-7 h-7 rounded-lg bg-slate-100 items-center justify-center mt-0.5">
        <Ionicons name={icon} size={13} color="#64748b" />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-0.5">
          {label}
        </Text>
        <Text
          className={`text-sm font-semibold ${
            highlight ? "text-forest-700" : "text-slate-800"
          }`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────
export default function RegistrationDetail() {
  const router = useRouter();
  const { permit } = useLocalSearchParams<{ permit: string }>();

  const [detail, setDetail] = useState<RegistrationDetailType | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load registration details ────────────────────────────────────────────
  useEffect(() => {
    if (!permit) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getRegistrationByPermit(permit);
        setDetail(res.data);
      } catch {
        setError("Failed to load registration details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [permit]);

  // ── Regenerate QR ────────────────────────────────────────────────────────
  const handleRegenerateQr = async () => {
    if (!permit) return;
    try {
      setQrLoading(true);
      const res = await regenerateQrCode(permit);
      if (res.data.success) {
        setQrBase64(res.data.qr_code);
        Alert.alert("Success", res.data.message);
      }
    } catch {
      Alert.alert("Error", "Failed to regenerate QR code. Please try again.");
    } finally {
      setQrLoading(false);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusCfg =
    STATUS_CONFIG[detail?.status ?? "registered"] ?? STATUS_CONFIG.registered;
  const diffCfg =
    DIFFICULTY_CONFIG[detail?.route?.difficulty ?? "easy"] ??
    DIFFICULTY_CONFIG.easy;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="text-slate-400 text-sm mt-3">
          Loading registration…
        </Text>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !detail) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-8">
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-slate-700 font-bold text-lg mt-3 text-center">
          {error ?? "Registration not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-slate-100 px-6 py-3 rounded-xl"
        >
          <Text className="text-slate-600 font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View
        className="bg-green-900 px-5 pt-4 pb-5"
        style={{
          shadowColor: "#0f5229",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/15 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={18} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold flex-1">
            Registration Detail
          </Text>
        </View>

        {/* Permit badge */}
        <View className="bg-white/10 rounded-2xl px-4 py-3 flex-row items-center justify-between">
          <View>
            <Text className="text-forest-300 text-[10px] font-bold uppercase tracking-wider">
              Permit Number
            </Text>
            <Text className="text-white text-lg font-extrabold mt-0.5">
              {detail.permit_number}
            </Text>
          </View>
          <View
            className={`flex-row items-center px-3 py-1.5 rounded-full ${statusCfg.bg}`}
          >
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusCfg.dot }}
            />
            <Text className={`text-[11px] font-bold capitalize ml-1.5 ${statusCfg.text}`}>
              {detail.status}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-12">

          {/* ── QR Code card ─────────────────────────────────────────────── */}
          <View
            className="bg-white rounded-3xl p-5 mb-4 items-center"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Entry QR Code
            </Text>

            {qrBase64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${qrBase64}` }}
                className="w-48 h-48 rounded-xl"
                resizeMode="contain"
              />
            ) : (
              <View className="w-48 h-48 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 items-center justify-center">
                <Ionicons name="qr-code" size={48} color="#94a3b8" />
                <Text className="text-slate-400 text-xs mt-2 text-center px-4">
                  Tap below to generate your QR code
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleRegenerateQr}
              disabled={qrLoading}
              activeOpacity={0.82}
              className="mt-4 flex-row items-center bg-forest-700 px-6 py-3 rounded-md"
              style={{
                opacity: qrLoading ? 0.7 : 1,
                shadowColor: "#15803d",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {qrLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="refresh" size={15} color="white" />
              )}
              <Text className="text-white text-sm font-bold ml-2">
                {qrBase64 ? "Regenerate QR Code" : "Generate QR Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Route info ───────────────────────────────────────────────── */}
          <View
            className="bg-white rounded-3xl p-4 mb-4"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 rounded-lg bg-forest-100 items-center justify-center">
                <Ionicons name="map" size={13} color="#1f8645" />
              </View>
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-widest">
                Route
              </Text>
            </View>

            <Text className="text-slate-900 text-base font-bold mb-2">
              {detail.route.name}
            </Text>

            <View className="flex-row">
              <View className={`flex-row items-center px-2.5 py-1 rounded-full mr-2 ${diffCfg.bg}`}>
                <Ionicons name="trending-up" size={11} color="#64748b" />
                <Text className={`text-[11px] font-bold ml-1 ${diffCfg.text}`}>
                  {diffCfg.label}
                </Text>
              </View>
              <View className="flex-row items-center mr-2 bg-slate-100 px-2.5 py-1 rounded-full">
                <Ionicons name="resize" size={11} color="#64748b" />
                <Text className="text-slate-600 text-[11px] font-bold ml-1">
                  {detail.route.total_distance_km} km
                </Text>
              </View>
              <View
                className={`flex-row items-center px-2.5 py-1 rounded-full ${
                  detail.route.status === "open"
                    ? "bg-emerald-100"
                    : "bg-red-100"
                }`}
              >
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      detail.route.status === "open" ? "#22c55e" : "#ef4444",
                  }}
                />
                <Text
                  className={`text-[11px] font-bold capitalize ml-1 ${
                    detail.route.status === "open"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {detail.route.status}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Registration details ──────────────────────────────────────── */}
          <View
            className="bg-white rounded-3xl px-4 mb-4"
            style={{
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center gap-2 pt-4 pb-2">
              <View className="w-7 h-7 rounded-lg bg-forest-100 items-center justify-center">
                <Ionicons name="person" size={13} color="#1f8645" />
              </View>
              <Text className="text-slate-700 text-xs font-bold uppercase tracking-widest">
                Travel Details
              </Text>
            </View>

            <InfoRow icon="person-circle" label="Full Name" value={detail.full_name} />
            <InfoRow
              icon="people"
              label="Group Size"
              value={`${detail.group_size} ${detail.group_size === 1 ? "person" : "people"}`}
            />
            <InfoRow
              icon="enter"
              label="Planned Entry"
              value={formatDateTime(detail.planned_entry)}
            />
            <InfoRow
              icon="exit"
              label="Planned Exit"
              value={formatDateTime(detail.planned_exit)}
            />
            {detail.actual_entry && (
              <InfoRow
                icon="checkmark-circle"
                label="Actual Entry"
                value={formatDateTime(detail.actual_entry)}
                highlight
              />
            )}
            {detail.actual_exit && (
              <InfoRow
                icon="flag"
                label="Actual Exit"
                value={formatDateTime(detail.actual_exit)}
                highlight
              />
            )}
            {detail.trek_duration && (
              <InfoRow icon="timer" label="Trek Duration" value={detail.trek_duration} />
            )}
            <InfoRow
              icon="calendar"
              label="Registered At"
              value={formatDateTime(detail.registered_at)}
            />

            {/* Overdue warning */}
            {detail.is_overdue && (
              <View className="flex-row items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 my-3">
                <Ionicons name="warning" size={16} color="#d97706" />
                <Text className="text-amber-700 text-xs font-bold flex-1">
                  This travel is overdue. Please contact the ranger station.
                </Text>
              </View>
            )}

            {/* Notes */}
            {detail.notes ? (
              <View className="py-3">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5px] mb-1.5">
                  Notes
                </Text>
                <View className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Text className="text-slate-600 text-sm leading-5">
                    {detail.notes}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}