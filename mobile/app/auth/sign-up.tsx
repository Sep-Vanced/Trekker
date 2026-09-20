import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../constants/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { RegisterPayload } from "@/types/auth";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Input field ──────────────────────────────────────────────────────────────
function InputField({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  showToggle,
  onToggle,
  required,
}: {
  label: string;
  icon: IoniconName;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  required?: boolean;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center gap-1 mb-2">
        <Text className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
          {label}
        </Text>
        {required && (
          <Text className="text-[11px] font-bold text-red-400">*</Text>
        )}
      </View>
      <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 gap-3">
        <Ionicons name={icon} size={15} color="#94a3b8" />
        <TextInput
          className="flex-1 py-3.5 text-[14px] text-slate-900"
          placeholder={placeholder}
          placeholderTextColor="#c8d3e0"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "words"}
          secureTextEntry={secureTextEntry}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
            <Ionicons
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
              size={15}
              color="#94a3b8"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label }: { icon: IoniconName; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5 mt-6 mb-4">
      <View
        className="w-6 h-6 rounded-lg items-center justify-center"
        style={{ backgroundColor: "#eaf5ef" }}
      >
        <Ionicons name={icon} size={12} color="#1a6b36" />
      </View>
      <Text className="text-[10px] font-bold text-slate-400 tracking-[1.5px] uppercase">
        {label}
      </Text>
      <View className="flex-1 h-px bg-slate-100" />
    </View>
  );
}

// ─── Progress steps ───────────────────────────────────────────────────────────
function ProgressSteps({ active }: { active: number }) {
  const steps = ["Account", "Emergency", "Security"];
  return (
    <View>
      {/* Bar */}
      <View className="flex-row gap-1.5 mb-3">
        {steps.map((_, i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: i < active ? "#fff" : "rgba(255,255,255,0.25)" }}
          />
        ))}
      </View>
      {/* Labels */}
      <View className="flex-row gap-1.5">
        {steps.map((s, i) => (
          <View
            key={s}
            className="flex-1 flex-row items-center gap-1"
            style={{ opacity: i < active ? 1 : 0.45 }}
          >
            <View
              className="w-4 h-4 rounded-full items-center justify-center"
              style={{ backgroundColor: i < active ? "rgba(255,255,255,0.2)" : "transparent" }}
            >
              <Text className="text-white text-[9px] font-bold">{i + 1}</Text>
            </View>
            <Text className="text-[#a8e6b8] text-[10px] font-medium">{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SignUp() {
  const [form, setForm] = useState<RegisterPayload>({
    username:                "",
    password:                "",
    email:                   "",
    first_name:              "",
    last_name:               "",
    role:                    "trekker",
    phone:                   "",
    emergency_contact_name:  "",
    emergency_contact_phone: "",
    offline_maps_downloaded: false,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirmPw,   setShowConfirmPw]   = useState(false);
  const [loading,         setLoading]         = useState(false);

  const { signUp } = useAuth();
  const router     = useRouter();

  const update = (key: keyof RegisterPayload, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSignUp = async () => {
    if (
      !form.username.trim() ||
      !form.password.trim() ||
      !form.email.trim() ||
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.phone.trim()
    ) {
      Alert.alert("Incomplete", "Please fill in all required fields.");
      return;
    }
    if (form.password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await signUp(form);
    setLoading(false);
    if (res.success) {
      Alert.alert("Registration Successful", "You have been registered successfully.");
      router.push("/auth/sign-in");
    }
    if (!res.success) Alert.alert("Registration Failed", res.error ?? "Please try again.");
  };

  const passwordsMatch = form.password === confirmPassword && confirmPassword.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#0f3d20]" edges={["top"]}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <View className="px-6 pt-5 pb-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-1.5 mb-6 self-start"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={14} color="#4caf72" />
              <Text className="text-[#4caf72] text-[13px] font-semibold">Back</Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3.5 mb-6">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
              >
                <Ionicons name="person-add" size={22} color="#a8e6b8" />
              </View>
              <View>
                <Text className="text-white text-[22px] font-extrabold tracking-tight">
                  Create Account
                </Text>
                <Text className="text-[#86c998] text-[12px] mt-0.5">
                  Register for Mapanuepe Trail
                </Text>
              </View>
            </View>

            {/* <ProgressSteps active={2} /> */}
          </View>

          {/* ── Form card ────────────────────────────────────────────── */}
          <View
            className="flex-1 bg-white rounded-t-[36px] px-6 pt-2 pb-10"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-5" />

            {/* ── Section 1: Account ─────────────────────────────────── */}
            <SectionHeader icon="person" label="Account Information" />

            <InputField
              label="Username"
              icon="at-outline"
              placeholder="e.g. juan_delaCruz"
              value={form.username}
              onChangeText={(v) => update("username", v)}
              autoCapitalize="none"
              required
            />
            <InputField
              label="First Name"
              icon="person-outline"
              placeholder="Juan"
              value={form.first_name}
              onChangeText={(v) => update("first_name", v)}
              required
            />
            <InputField
              label="Last Name"
              icon="person-outline"
              placeholder="Dela Cruz"
              value={form.last_name}
              onChangeText={(v) => update("last_name", v)}
              required
            />
            <InputField
              label="Email Address"
              icon="mail-outline"
              placeholder="juan@example.com"
              value={form.email}
              onChangeText={(v) => update("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
            <InputField
              label="Phone Number"
              icon="call-outline"
              placeholder="09171234567"
              value={form.phone}
              onChangeText={(v) => update("phone", v)}
              keyboardType="phone-pad"
              autoCapitalize="none"
              required
            />

            {/* ── Section 2: Emergency ───────────────────────────────── */}
            <SectionHeader icon="warning" label="Emergency Contact" />

            <InputField
              label="Contact Name"
              icon="people-outline"
              placeholder="Maria Dela Cruz"
              value={form.emergency_contact_name}
              onChangeText={(v) => update("emergency_contact_name", v)}
            />
            <InputField
              label="Contact Number"
              icon="phone-portrait-outline"
              placeholder="09987654321"
              value={form.emergency_contact_phone}
              onChangeText={(v) => update("emergency_contact_phone", v)}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            {/* ── Section 3: Security ────────────────────────────────── */}
            <SectionHeader icon="shield-checkmark" label="Security" />

            <InputField
              label="Password"
              icon="lock-closed-outline"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChangeText={(v) => update("password", v)}
              secureTextEntry={!showPw}
              showToggle
              onToggle={() => setShowPw((p) => !p)}
              autoCapitalize="none"
              required
            />
            <InputField
              label="Confirm Password"
              icon="lock-open-outline"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPw}
              showToggle
              onToggle={() => setShowConfirmPw((p) => !p)}
              autoCapitalize="none"
              required
            />

            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <View className="flex-row items-center gap-2 -mt-2 mb-3 px-0.5">
                <Ionicons
                  name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                  size={13}
                  color={passwordsMatch ? "#16a34a" : "#ef4444"}
                />
                <Text
                  className={`text-[12px] font-medium ${
                    passwordsMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </Text>
              </View>
            )}

            {/* Safety notice */}
            <View
              className="flex-row gap-3 rounded-2xl p-4 mt-2 mb-6"
              style={{ backgroundColor: "#fffbeb", borderWidth: 0.5, borderColor: "#fde68a" }}
            >
              <Ionicons name="warning-outline" size={14} color="#d97706" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-[12px] text-amber-800 leading-[18px]">
                By registering, you agree to follow all safety guidelines and take
                responsibility for your safety during travelling activities.
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.88}
              className="rounded-2xl py-4 items-center justify-center mb-5"
              style={{ backgroundColor: "#1a4d2e" }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[15px] font-bold tracking-wide">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-slate-400 text-[13px]">Already registered?</Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/sign-in")}
                activeOpacity={0.7}
              >
                <Text className="text-[#1a6b36] text-[13px] font-bold"> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}