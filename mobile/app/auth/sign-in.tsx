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
import { useState, useCallback } from "react";
import { useAuth } from "../../constants/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

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
}) {
  return (
    <View className="mb-4">
      <Text className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest mb-2">
        {label}
      </Text>
      <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 gap-3">
        <Ionicons name={icon} size={15} color="#94a3b8" />
        <TextInput
          className="flex-1 py-3.5 text-slate-900 text-[14px]"
          placeholder={placeholder}
          placeholderTextColor="#c8d3e0"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize ?? "none"}
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

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setUsername("");
      setPassword("");
      setShowPw(false);
      setLoading(false);
    }, [])
  );

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your username and password.");
      return;
    }
    setLoading(true);
    const res = await signIn(username.trim(), password);
    setLoading(false);

    if (res.success) {
      if (res.role === "ranger") {
        router.replace("/(ranger)/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } else {
      Alert.alert("Sign In Failed", res.error ?? "Invalid credentials.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f3d20]" edges={["top", "bottom"]}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Hero ─────────────────────────────────────────────────── */}
          <View className="items-start px-6 pt-10 pb-10">
            <View
              className="w-14 h-14 rounded-[18px] items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Ionicons name="trail-sign" size={28} color="#a8e6b8" />
            </View>

            <Text className="text-white text-[30px] font-extrabold tracking-tight leading-tight">
              Mapanuepe{"\n"}Trail
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2 mb-5">
              <View className="w-1.5 h-1.5 rounded-full bg-[#4caf72]" />
              <Text className="text-[#4caf72] text-[12px] font-medium">
                San Marcelino, Zambales
              </Text>
            </View>

            <View className="flex-row gap-2">
              {(
                [
                  { icon: "footsteps" as IoniconName, label: "Travel" },
                  { icon: "map" as IoniconName, label: "Navigate" },
                  { icon: "shield" as IoniconName, label: "Safe" },
                ]
              ).map((c) => (
                <View
                  key={c.label}
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <Ionicons name={c.icon} size={11} color="#a8e6b8" />
                  <Text className="text-[#a8e6b8] text-[11px] font-medium ml-1.5">
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Form card ──────────────────────────────────────────────── */}
          <View
            className="flex-1 bg-white rounded-t-[36px] px-6 pt-6 pb-10"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.06,
              shadowRadius: 24,
              elevation: 10,
            }}
          >
            <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-6" />

            <Text className="text-slate-900 text-[24px] font-extrabold mb-1">
              Welcome back
            </Text>
            <Text className="text-slate-400 text-[13px] mb-7">
              Sign in to continue your journey
            </Text>

            <InputField
              label="Username"
              icon="person-outline"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <InputField
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              showToggle
              onToggle={() => setShowPw((p) => !p)}
            />

            <TouchableOpacity
              className="items-end mb-7 -mt-1"
              activeOpacity={0.7}
            >
              <Text className="text-[#1a6b36] text-[13px] font-semibold">
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-2xl py-4 items-center justify-center mb-4"
              style={{ backgroundColor: "#1a4d2e" }}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-[15px] font-bold tracking-wide">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-slate-400 text-[13px]">
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/sign-up")}
                activeOpacity={0.7}
              >
                <Text className="text-[#1a6b36] text-[13px] font-bold"> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}