import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { CameraView, Camera, type BarcodeScanningResult } from "expo-camera";
import { logEntry, logExit, ScanAction } from "@/api/ranger";

// ─── Parse QR ────────────────────────────────────────────────────────────────
function parseQrPayload(raw: string) {
  const parts = raw.split("|");
  if (parts.length < 2) return null;
  return {
    prefix: parts[0],
    trackingId: parts[1],
    routeId: parts[2],
    userId: parts[3],
    date: parts[4],
  };
}

// ─── Corner Marker ────────────────────────────────────────────────────────────
function CornerMarker({
  position,
  inset = 0,
  color = "#4cde80",
}: {
  position: "tl" | "tr" | "bl" | "br";
  inset?: number;
  color?: string;
}) {
  const isTop = position.includes("t");
  const isLeft = position.includes("l");
  return (
    <View
      style={{
        position: "absolute",
        width: 28,
        height: 28,
        borderColor: color,
        borderRadius: 4,
        borderTopWidth: isTop ? 3 : 0,
        borderBottomWidth: !isTop ? 3 : 0,
        borderLeftWidth: isLeft ? 3 : 0,
        borderRightWidth: !isLeft ? 3 : 0,
        top: isTop ? inset : undefined,
        bottom: !isTop ? inset : undefined,
        left: isLeft ? inset : undefined,
        right: !isLeft ? inset : undefined,
      }}
    />
  );
}

// ─── Result Modal ─────────────────────────────────────────────────────────────
function ResultModal({
  visible,
  success,
  message,
  action,
  onClose,
  onScanAgain,
}: {
  visible: boolean;
  success: boolean;
  message: string;
  action: ScanAction;
  onClose: () => void;
  onScanAgain: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 200,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const isEntry = action === "entry";
  const accentColor = success ? (isEntry ? "#16a34a" : "#dc2626") : "#dc2626";
  const bgColor = success ? (isEntry ? "#f0fdf4" : "#fef2f2") : "#fef2f2";
  const iconName = success ? (isEntry ? "enter" : "exit") : "close-circle";
  const iconBg = success ? (isEntry ? "#dcfce7" : "#fee2e2") : "#fee2e2";

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 28, opacity: opacityAnim }}
      >
        <Animated.View
          style={{
            width: "100%",
            borderRadius: 28,
            backgroundColor: "#fff",
            overflow: "hidden",
            transform: [{ scale: scaleAnim }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 32,
            elevation: 20,
          }}
        >
          {/* Colored top band */}
          <View style={{ backgroundColor: bgColor, alignItems: "center", paddingTop: 36, paddingBottom: 28, paddingHorizontal: 24 }}>
            {/* Icon circle */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: iconBg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name={iconName} size={36} color={accentColor} />
            </View>

            <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 6, textAlign: "center" }}>
              {success ? (isEntry ? "Entry Recorded" : "Exit Recorded") : "Scan Failed"}
            </Text>

            <Text style={{ fontSize: 13, color: "#6b7280", textAlign: "center", lineHeight: 20 }}>
              {message}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#f3f4f6" }} />

          {/* Action buttons */}
          <View style={{ flexDirection: "row", padding: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: "#f3f4f6",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151" }}>
                Done
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onScanAgain}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: accentColor,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="qr-code-outline" size={15} color="#fff" />
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>
                  Scan Again
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ScanScreen() {
  const [qrInput, setQrInput] = useState("");
  const [action, setAction] = useState<ScanAction>("entry");
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });
  const [parsedInfo, setParsedInfo] = useState<ReturnType<typeof parseQrPayload>>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const scanCooldown = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, []);

  const handleQrChange = (val: string) => {
    setQrInput(val);
    setResultModal((p) => ({ ...p, visible: false }));
    setParsedInfo(parseQrPayload(val));
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanCooldown.current) return;
    scanCooldown.current = true;
    setScanned(true);
    setCameraActive(false);

    const parsed = parseQrPayload(data);
    if (!parsed || parsed.prefix !== "SMARTTREK") {
      Alert.alert("Invalid QR", "This is not a SmartTrek QR code.", [
        {
          text: "Scan Again",
          onPress: () => {
            setScanned(false);
            scanCooldown.current = false;
            setCameraActive(true);
          },
        },
        { text: "Cancel", onPress: () => { scanCooldown.current = false; } },
      ]);
      return;
    }

    setQrInput(data);
    setParsedInfo(parsed);
    setResultModal((p) => ({ ...p, visible: false }));

    setTimeout(() => {
      scanCooldown.current = false;
      processEntry(data, parsed, action);
    }, 600);
  };

  const processEntry = async (
    raw: string,
    parsed: NonNullable<ReturnType<typeof parseQrPayload>>,
    currentAction: ScanAction
  ) => {
    setLoading(true);
    setResultModal((p) => ({ ...p, visible: false }));
    try {
      const payload = { qr_payload: raw.trim(), action: currentAction };
      if (currentAction === "entry") {
        await logEntry(parsed.trackingId, payload);
      } else {
        await logExit(parsed.trackingId, payload);
      }
      setResultModal({
        visible: true,
        success: true,
        message: `Traveler ${parsed.trackingId} ${currentAction === "entry" ? "entry" : "exit"} recorded successfully.`,
      });
      setQrInput("");
      setParsedInfo(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to process QR. Try again.";
      setResultModal({ visible: true, success: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!qrInput.trim()) {
      Alert.alert("Missing QR", "Please scan or paste the QR payload.");
      return;
    }
    const parsed = parseQrPayload(qrInput.trim());
    if (!parsed || parsed.prefix !== "SMARTTREK") {
      Alert.alert("Invalid QR", "The QR payload format is not recognized.");
      return;
    }
    await processEntry(qrInput.trim(), parsed, action);
  };

  const openCamera = () => {
    if (hasCameraPermission === false) {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access in your device settings.",
        [{ text: "OK" }]
      );
      return;
    }
    setScanned(false);
    setResultModal((p) => ({ ...p, visible: false }));
    setCameraActive(true);
  };

  const closeCamera = () => {
    setCameraActive(false);
    setScanned(false);
    scanCooldown.current = false;
  };

  const handleModalClose = () => {
    setResultModal((p) => ({ ...p, visible: false }));
  };

  const handleScanAgain = () => {
    setResultModal((p) => ({ ...p, visible: false }));
    setQrInput("");
    setParsedInfo(null);
    openCamera();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" />

      {/* ── Result Modal ──────────────────────────────────────────── */}
      <ResultModal
        visible={resultModal.visible}
        success={resultModal.success}
        message={resultModal.message}
        action={action}
        onClose={handleModalClose}
        onScanAgain={handleScanAgain}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View className="px-5 pt-5 pb-6 bg-green-900">
          <Text className="text-[#4cde80] text-[11px] font-bold uppercase tracking-[2px] mb-1">
            Ranger Control
          </Text>
          <Text className="text-white text-2xl font-extrabold -tracking-[0.5px]">
            QR Scanner
          </Text>
          <Text className="text-white/50 text-[13px] mt-1">
            Scan travelers QR codes for entry or exit
          </Text>
        </View>

        <View className="px-5 pt-5 pb-28">
          {/* ── Camera / Placeholder Box ─────────────────────────── */}
          <View className="h-[320px] rounded-3xl mb-6 overflow-hidden border border-black/10 bg-green-500/20">
            {cameraActive ? (
              <>
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                />
                {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                  <CornerMarker key={pos} position={pos} inset={12} color="#4cde80" />
                ))}
                <View
                  className="absolute bottom-0 left-0 right-0 items-center pb-3 pt-5"
                  style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                  pointerEvents="none"
                >
                  <Text className="text-white/80 text-xs font-medium">
                    Align QR code within the frame
                  </Text>
                </View>
                <TouchableOpacity
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                  onPress={closeCamera}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                className="flex-1 items-center justify-center"
                onPress={openCamera}
                activeOpacity={0.8}
              >
                {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                  <CornerMarker key={pos} position={pos} inset={20} />
                ))}
                <Ionicons name="qr-code-outline" size={52} color="#14532d" />
                <Text className="text-white/35 text-xs font-medium mt-2 mb-3.5">
                  {hasCameraPermission === false
                    ? "Camera permission denied"
                    : "Tap to open camera"}
                </Text>
                {hasCameraPermission !== false && (
                  <View className="flex-row items-center bg-green-700 px-4 py-2 rounded-full">
                    <Ionicons name="camera" size={14} color="#FFF" />
                    <Text className="text-white mx-1 text-xs font-bold">Open Camera</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Action toggle ─────────────────────────────────────── */}
          <Text className="text-black/50 text-[11px] font-bold uppercase tracking-[2px] mb-2">
            Action
          </Text>
          <View className="flex-row bg-green-500/30 p-1.5 rounded-2xl border border-white/10">
            {(["entry", "exit"] as ScanAction[]).map((a) => {
              const isActive = action === a;
              const isEntry = a === "entry";
              return (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAction(a)}
                  activeOpacity={0.85}
                  className={`flex-1 py-3 rounded-xl flex-row items-center justify-center`}
                  style={{
                    backgroundColor: isActive
                      ? isEntry ? "#1a4d2e" : "#b91c1c"
                      : "transparent",
                  }}
                >
                  <Ionicons
                    name={isEntry ? "enter-outline" : "exit-outline"}
                    size={16}
                    color={isActive ? "#FFFFFF" : "#14532d"}
                  />
                  <Text
                    className="text-[13px] font-semibold capitalize mx-1"
                    style={{ color: isActive ? "#FFFFFF" : "#14532d" }}
                  >
                    {a}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── QR Input ──────────────────────────────────────────── */}
          <Text className="text-black/50 text-[11px] font-bold uppercase tracking-[2px] mb-2 mt-5">
            QR Payload
          </Text>
          <View className="rounded-2xl p-4 mb-5 border border-black/10 bg-green-500/10">
            <TextInput
              className="text-green-900 text-[13px] min-h-[48px]"
              placeholder="(ex.SMARTTREK|TRK-XXXXXXXX|...)"
              placeholderTextColor="#14532d"
              value={qrInput}
              onChangeText={handleQrChange}
              autoCapitalize="characters"
              multiline
            />
          </View>

          {/* Parsed info preview */}
          {parsedInfo && (
            <View
              className="rounded-2xl p-3 mb-4"
              style={{ backgroundColor: "rgba(76,222,128,0.06)" }}
            >
              <Text className="text-[#4cde80] text-[11px] font-bold uppercase tracking-[2px] mb-1">
                Parsed
              </Text>
              {Object.entries(parsedInfo).map(([k, v]) => (
                <View key={k} className="flex-row justify-between">
                  <Text className="text-white/40 text-[11px] capitalize">
                    {k.replace(/([A-Z])/g, " $1")}
                  </Text>
                  <Text className="text-white text-[11px] font-semibold">{v}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleScan}
            disabled={loading}
            activeOpacity={0.85}
            className="rounded-2xl py-5 flex-row items-center justify-center mt-2"
            style={{ backgroundColor: action === "entry" ? "#1a4d2e" : "#b91c1c" }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row">
                <Ionicons
                  name={action === "entry" ? "enter" : "exit"}
                  size={18}
                  color="white"
                />
                <Text className="text-white text-[15px] font-bold mx-2">
                  Record {action === "entry" ? "Entry" : "Exit"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}