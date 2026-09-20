import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  registerTrekker,
  createTrekkingSession,
  getRegistrationQrUrl,
} from "../../api/trekking";
import { TourismRegistration } from "@/types/trekking-types";
import DateTimePicker from "@react-native-community/datetimepicker";

// ─── Types ────────────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
type Step = "register" | "qr" | "starting";

// ─── Difficulty gradient map ──────────────────────────────────────────────────
const DIFF_GRADIENT: Record<string, [string, string]> = {
  easy:     ["#15803d", "#22c55e"],
  moderate: ["#1d4ed8", "#3b82f6"],
  hard:     ["#c2410c", "#f97316"],
  expert:   ["#b91c1c", "#ef4444"],
};
const getDiffGradient = (d: string): [string, string] =>
  DIFF_GRADIENT[d?.toLowerCase()] ?? DIFF_GRADIENT.moderate;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toLocalISO = (dateStr: string, timeStr: string, tzOffset = "+08:00"): string => {
  // dateStr: "YYYY-MM-DD", timeStr: "HH:MM"
  return `${dateStr}T${timeStr}:00${tzOffset}`;
};

const today = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldLabel({ icon, label, required }: { icon: IoniconName; label: string; required?: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5 mb-2">
      <Ionicons name={icon} size={13} color="#6b7280" />
      <Text className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.8px]">{label}</Text>
      {required && <Text className="text-red-400 text-[11px] font-bold ml-0.5">*</Text>}
    </View>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────
function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string; icon: IoniconName }[] = [
    { key: "register", label: "Register",  icon: "document-text" },
    { key: "qr",       label: "QR Code",   icon: "qr-code" },
    { key: "starting", label: "Start",     icon: "navigate" },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <View className="flex-row items-center px-6 py-3">
      {steps.map((s, i) => (
        <View key={s.key} className="flex-row items-center flex-1">
          <View className="items-center flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                i < idx ? "bg-emerald-500" : i === idx ? "bg-forest-700" : "bg-gray-200"
              }`}
            >
              {i < idx ? (
                <Ionicons name="checkmark" size={15} color="white" />
              ) : (
                <Ionicons name={s.icon} size={14} color={i === idx ? "white" : "#9ca3af"} />
              )}
            </View>
            <Text
              className={`text-[9px] font-bold mt-1 tracking-[0.5px] uppercase ${
                i <= idx ? "text-forest-800" : "text-gray-400"
              }`}
            >
              {s.label}
            </Text>
          </View>
          {i < steps.length - 1 && (
            <View
              className={`h-[1.5px] flex-1 mx-1 mb-4 rounded-full ${
                i < idx ? "bg-emerald-400" : "bg-gray-200"
              }`}
            />
          )}
        </View>
      ))}
    </View>
  );
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QrModal({
  visible,
  registration,
  routeId,
  onStartTrek,
  onClose,
}: {
  visible: boolean;
  registration: TourismRegistration | null;
  routeId: number;
  onStartTrek: () => void;
  onClose: () => void;
}) {
  const [starting, setStarting] = useState(false);

  if (!registration) return null;
  const qrUri = `data:image/png;base64,${registration.qr_code}`;

  const handleStart = async () => {
    setStarting(true);
    onStartTrek();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="bg-forest-900 px-5 pt-4 pb-6">
            <TouchableOpacity
              onPress={onClose}
              className="self-start flex-row items-center bg-white/20 px-3 py-1.5 rounded-full mb-4"
            >
              <Ionicons name="close" size={16} color="white" />
              <Text className="text-white text-xs font-semibold ml-1.5">Close</Text>
            </TouchableOpacity>
            <Text className="text-white/60 text-[10px] font-bold uppercase tracking-[1.5px]">
              Registration Complete
            </Text>
            <Text className="text-white text-xl font-extrabold mt-1">Your Travel Pass</Text>
          </View>

          <View className="px-5 pt-5 pb-8">
            {/* Reg number */}
            <View className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-4 flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center">
                <Ionicons name="checkmark-circle" size={20} color="#15803d" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.8px]">
                  Registration Number
                </Text>
                <Text className="text-emerald-900 text-base font-extrabold tracking-wider">
                  {registration.permit_number}
                </Text>
              </View>
            </View>

            {/* QR Code */}
            <View className="bg-white border border-gray-200 rounded-3xl p-5 mb-4 items-center shadow-sm">
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-[1px] mb-4">
                Scan at trailhead checkpoint
              </Text>
              <Image source={{ uri: qrUri }} style={{ width: 200, height: 200 }} resizeMode="contain" />
              <Text className="text-[10px] text-gray-400 mt-4 text-center leading-4">
                Show this QR code to the ranger at the trailhead before starting your travel.
              </Text>
            </View>

            {/* Summary */}
            <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 gap-3">
              {[
                { icon: "calendar" as IoniconName, label: "Entry", value: new Date(registration.registration.planned_entry).toLocaleString() },
                { icon: "calendar-outline" as IoniconName, label: "Exit", value: new Date(registration.registration.planned_exit).toLocaleString() },
                { icon: "people" as IoniconName, label: "Group Size", value: `${registration.registration.group_size} person(s)` },
                ...(registration.registration.notes ? [{ icon: "document-text" as IoniconName, label: "Notes", value: registration.registration.notes }] : []),
              ].map((item) => (
                <View key={item.label} className="flex-row items-start gap-3">
                  <View className="w-7 h-7 rounded-lg bg-slate-200 items-center justify-center mt-0.5">
                    <Ionicons name={item.icon} size={13} color="#64748b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.5px]">{item.label}</Text>
                    <Text className="text-sm text-slate-700 font-semibold">{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Start button */}
            <TouchableOpacity
              onPress={handleStart}
              disabled={starting}
              activeOpacity={0.85}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                shadowColor: "#15803d",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#15803d", "#22c55e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 }}
              >
                {starting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="navigate" size={18} color="white" />
                    <Text className="text-white text-base font-extrabold tracking-wide">Begin Travel</Text>
                    <Ionicons name="arrow-forward" size={15} color="rgba(255,255,255,0.7)" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TrekStart() {
  const router = useRouter();
  const { routeId, routeName, routeDifficulty } = useLocalSearchParams<{
    routeId: string;
    routeName: string;
    routeDifficulty: string;
  }>();
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [showExitDatePicker, setShowExitDatePicker] = useState(false);

  const decodedName = routeName ? decodeURIComponent(routeName) : "Route";
  const decodedDiff = routeDifficulty ? decodeURIComponent(routeDifficulty) : "moderate";
  const gradient = getDiffGradient(decodedDiff);

  // ── Form state ────────────────────────────────────────────────────────────
  const [entryDate, setEntryDate] = useState(today());
  const [entryTime, setEntryTime] = useState("06:00");
  const [exitDate, setExitDate]   = useState(today());
  const [exitTime, setExitTime]   = useState("14:00");
  const [groupSize, setGroupSize] = useState("1");
  const [notes, setNotes]         = useState("");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [step, setStep]                       = useState<Step>("register");
  const [loading, setLoading]                 = useState(false);
  const [registration, setRegistration]       = useState<TourismRegistration | null>(null);
  const [showQr, setShowQr]                   = useState(false);
  const [fieldErrors, setFieldErrors]         = useState<Record<string, string>>({});

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!entryDate) errors.entryDate = "Required";
    if (!entryTime) errors.entryTime = "Required";
    if (!exitDate)  errors.exitDate  = "Required";
    if (!exitTime)  errors.exitTime  = "Required";
    const gs = parseInt(groupSize);
    if (!groupSize || isNaN(gs) || gs < 1) errors.groupSize = "Must be at least 1";
    if (gs > 50) errors.groupSize = "Maximum group size is 50";
    const entry = new Date(toLocalISO(entryDate, entryTime));
    const exit  = new Date(toLocalISO(exitDate,  exitTime));
    if (exit <= entry) errors.exitTime = "Exit must be after entry";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit registration ───────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await registerTrekker({
        route_id:      Number(routeId),
        planned_entry: toLocalISO(entryDate, entryTime),
        planned_exit:  toLocalISO(exitDate,  exitTime),
        group_size:    parseInt(groupSize),
        notes:         notes.trim() || undefined,
      });
      setRegistration(res.data);
      setStep("qr");
      setShowQr(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail
        ?? err?.response?.data?.non_field_errors?.[0]
        ?? "Registration failed. Please try again.";
      Alert.alert("Registration Error", detail);
    } finally {
      setLoading(false);
    }
  };

  // ── Create session + navigate ─────────────────────────────────────────────
  const handleStartTrek = async () => {
    try {
      await createTrekkingSession({ route_id: Number(routeId) });
      setShowQr(false);
      setStep("starting");
      // Navigate to the active trek screen
      router.replace("/(tabs)/trek");
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Could not start session. Please try again.";
      Alert.alert("Error", detail);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#14532d", "#166534"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pb-5"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center self-start bg-white/20 px-3 py-1.5 rounded-full mb-4 mt-1"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text className="text-white text-xs font-semibold ml-1.5">Back</Text>
        </TouchableOpacity>

        <Text className="text-white/60 text-[10px] font-bold uppercase tracking-[1.5px] mb-1">
          Pre-Travel Registration
        </Text>
        <Text className="text-white text-xl font-extrabold" numberOfLines={2}>
          {decodedName}
        </Text>

        {/* Difficulty pill */}
        <View
          className="self-start mt-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-white text-[11px] font-bold capitalize">{decodedDiff}</Text>
        </View>
      </LinearGradient>

      {/* ── Stepper ───────────────────────────────────────────────────────── */}
      <View className="bg-white border-b border-slate-100">
        <Stepper step={step} />
      </View>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Info banner */}
          <View className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-5 flex-row items-start gap-3">
            <Ionicons name="information-circle" size={18} color="#0284c7" style={{ marginTop: 1 }} />
            <Text className="flex-1 text-xs text-sky-700 leading-5">
              Registration is required before starting any travel. Your QR code will be checked at the trailhead.
            </Text>
          </View>

          {/* ── Entry ─────────────────────────────────────────────────────── */}
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <Text className="text-sm font-extrabold text-slate-800 mb-4">🗓️ Planned Schedule</Text>

            {/* Entry date + time */}
            <FieldLabel icon="calendar" label="Planned Entry" required />
            <View className="flex-row gap-2 mb-1">
            <View className="flex-1">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowEntryDatePicker(true)}
                className={`bg-slate-50 border rounded-xl px-3 py-3 ${
                  fieldErrors.entryDate ? "border-red-400" : "border-slate-200"
                }`}
              >
                <Text className={`text-sm ${entryDate ? "text-slate-800" : "text-gray-400"}`}>
                  {entryDate || "YYYY-MM-DD"}
                </Text>
              </TouchableOpacity>

              {fieldErrors.entryDate && (
                <Text className="text-red-400 text-[10px] mt-1">
                  {fieldErrors.entryDate}
                </Text>
              )}

              {showEntryDatePicker && (
                <DateTimePicker
                  value={new Date(entryDate || new Date())}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEntryDatePicker(false);
                    if (selectedDate) {
                      setEntryDate(selectedDate.toISOString().split("T")[0]);
                    }
                  }}
                />
              )}
            </View>
              <View className="flex-1">
                <TextInput
                  value={entryTime}
                  onChangeText={setEntryTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#9ca3af"
                  className={`bg-slate-50 border rounded-xl px-3 py-3 text-slate-800 text-sm ${
                    fieldErrors.entryTime ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {fieldErrors.entryTime && (
                  <Text className="text-red-400 text-[10px] mt-1">{fieldErrors.entryTime}</Text>
                )}
              </View>
            </View>

            <View className="h-px bg-slate-100 my-3" />

            {/* Exit date + time */}
            <FieldLabel icon="calendar-outline" label="Planned Exit" required />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowExitDatePicker(true)}
                  className={`bg-slate-50 border rounded-xl px-3 py-3 ${
                    fieldErrors.exitDate ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <Text className={`text-sm ${exitDate ? "text-slate-800" : "text-gray-400"}`}>
                    {exitDate || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>

                {fieldErrors.exitDate && (
                  <Text className="text-red-400 text-[10px] mt-1">
                    {fieldErrors.exitDate}
                  </Text>
                )}

                {showExitDatePicker && (
                  <DateTimePicker
                    value={new Date(exitDate || new Date())}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowExitDatePicker(false);
                      if (selectedDate) {
                        setExitDate(selectedDate.toISOString().split("T")[0]);
                      }
                    }}
                  />
                )}
              </View>
              <View className="flex-1">
                <TextInput
                  value={exitTime}
                  onChangeText={setExitTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#9ca3af"
                  className={`bg-slate-50 border rounded-xl px-3 py-3 text-slate-800 text-sm ${
                    fieldErrors.exitTime ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {fieldErrors.exitTime && (
                  <Text className="text-red-400 text-[10px] mt-1">{fieldErrors.exitTime}</Text>
                )}
              </View>
            </View>
          </View>

          {/* ── Group ─────────────────────────────────────────────────────── */}
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <Text className="text-sm font-extrabold text-slate-800 mb-4">👥 Group Details</Text>

            <FieldLabel icon="people" label="Group Size" required />
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => setGroupSize((v) => String(Math.max(1, parseInt(v || "1") - 1)))}
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center"
              >
                <Ionicons name="remove" size={18} color="#475569" />
              </TouchableOpacity>
              <TextInput
                value={groupSize}
                onChangeText={(v) => setGroupSize(v.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                className={`flex-1 bg-slate-50 border rounded-xl px-3 py-3 text-slate-800 text-sm text-center font-bold ${
                  fieldErrors.groupSize ? "border-red-400" : "border-slate-200"
                }`}
              />
              <TouchableOpacity
                onPress={() => setGroupSize((v) => String(Math.min(50, parseInt(v || "1") + 1)))}
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center"
              >
                <Ionicons name="add" size={18} color="#475569" />
              </TouchableOpacity>
            </View>
            {fieldErrors.groupSize && (
              <Text className="text-red-400 text-[10px] mt-1">{fieldErrors.groupSize}</Text>
            )}
          </View>

          {/* ── Notes ─────────────────────────────────────────────────────── */}
          <View className="bg-white rounded-2xl p-4 mb-5 border border-slate-100">
            <Text className="text-sm font-extrabold text-slate-800 mb-4">📝 Notes (Optional)</Text>
            <FieldLabel icon="document-text-outline" label="Health / Special Notes" />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. One member has asthma, carrying first aid kit..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 text-sm min-h-[90px]"
            />
          </View>

          {/* ── Submit ────────────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              borderRadius: 18,
              overflow: "hidden",
              shadowColor: gradient[0],
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 16,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={18} color="white" />
                  <Text className="text-white text-base font-extrabold tracking-wide">
                    Register & Get QR Code
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── QR Code modal ─────────────────────────────────────────────────── */}
      <QrModal
        visible={showQr}
        registration={registration}
        routeId={Number(routeId)}
        onStartTrek={handleStartTrek}
        onClose={() => setShowQr(false)}
      />
    </SafeAreaView>
  );
}