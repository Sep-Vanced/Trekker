import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { VEHICLES } from "../../data/staticData";
import { getCampsites } from "../../api/navigation";
import { Campsite } from "@/types/navigation-types";
import { PHASE_CONFIG } from "@/utils/phase-config";
import { useLocationWeather } from "@/hooks/useLocationWeather";
import WeatherCard from "@/components/WeatherCard";
import { StatusBar } from "expo-status-bar";
import {
  ChevronLeft,
  Car,
  MapPin,
  Bot,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Flag,
  Sparkles,
  Tent,
  WifiOff,
} from "lucide-react-native";

// ─── Camp selector card ───────────────────────────────────────────────────────
function CampSelectorCard({
  campsite,
  isSelected,
  isLast,
  onPress,
}: {
  campsite: Campsite;
  isSelected: boolean;
  isLast: boolean;
  onPress: () => void;
}) {
  const phase = PHASE_CONFIG[campsite.phase];
  const phaseColor = phase?.mapColor ?? "#1f8645";
  const phaseLabel = phase?.label ?? campsite.phase;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-3.5 ${
        !isLast ? "border-b border-gray-100" : ""
      } ${isSelected ? "bg-forest-50" : ""}`}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${phaseColor}18`, borderWidth: 1.5, borderColor: `${phaseColor}30` }}
      >
        <Tent size={16} color={phaseColor} strokeWidth={2} />
      </View>

      <View className="flex-1">
        <Text className={`text-sm font-semibold ${isSelected ? "text-forest-800" : "text-gray-800"}`}>
          {campsite.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <View
            className="px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${phaseColor}18` }}
          >
            <Text className="text-[10px] font-bold" style={{ color: phaseColor }}>
              {phaseLabel}
            </Text>
          </View>
          {campsite.description && (
            <View className="flex-row items-center gap-1">
              <MapPin size={9} color="#9ca3af" strokeWidth={2} />
              <Text className="text-gray-400 text-[10px]" numberOfLines={1}>
                {campsite.description}
              </Text>
            </View>
          )}
        </View>
      </View>

      {isSelected ? (
        <View className="w-7 h-7 bg-forest-700 rounded-full items-center justify-center">
          <CheckCircle size={14} color="#fff" strokeWidth={2.5} />
        </View>
      ) : (
        <ChevronRight size={16} color="#d1d5db" strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function VehicleCheck() {
  const router = useRouter();

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedCamp,    setSelectedCamp]    = useState<string | null>(null);
  const [aiResult,        setAiResult]        = useState<string | null>(null);
  const [loading,         setLoading]         = useState(false);

  // ── Live weather (same hook as Home) ─────────────────────────────────────
  const { weather, loading: weatherLoading, error: weatherError, refresh: refreshWeather } =
    useLocationWeather();

  // ── Live campsites ────────────────────────────────────────────────────────
  const [campsites,        setCampsites]        = useState<Campsite[]>([]);
  const [campsitesLoading, setCampsitesLoading] = useState(true);
  const [campsitesError,   setCampsitesError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCampsites();
        setCampsites(res.data.filter((c) => c.is_active));
      } catch {
        setCampsitesError("Failed to load campsites.");
      } finally {
        setCampsitesLoading(false);
      }
    })();
  }, []);

  const getAIRecommendation = async () => {
    if (!selectedVehicle || !selectedCamp) return;
    setLoading(true);
    setAiResult(null);

    const vehicle  = VEHICLES.find((v) => v.id === selectedVehicle);
    const campsite = campsites.find((c) => String(c.id) === selectedCamp);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a trekking safety advisor for Mapanuepe Lake in San Marcelino, Zambales, Philippines.

Vehicle: ${vehicle?.name}
Destination: ${campsite?.name} (Phase: ${campsite?.phase})
Weather: ${weather?.condition ?? "Unknown"} (Status: ${weather?.status ?? "Unknown"}, Temperature: ${weather?.temperature ?? "N/A"}°C, Wind: ${weather?.windSpeed ?? "N/A"}km/h, Humidity: ${weather?.humidity ?? "N/A"}%)
Vehicle restrictions: ${vehicle?.restrictions.join(", ")}

Give a short, practical safety recommendation (3-4 sentences max) about whether this vehicle is safe for this route TODAY given the weather. Include one specific tip. Be direct and conversational, like a local guide would speak. Start with ✅ if safe, ⚠️ if caution needed, or ❌ if not recommended.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text ?? "Unable to generate recommendation.";
      setAiResult(text);
    } catch {
      setAiResult(`⚠️ Could not reach AI service. Please check your connection and try again.`);
    }
    setLoading(false);
  };

  const selectedVehicleData = VEHICLES.find((v) => v.id === selectedVehicle);
  const canSubmit = selectedVehicle && selectedCamp && !loading;

  const resultType = aiResult?.startsWith("✅") ? "safe"
    : aiResult?.startsWith("❌") ? "danger"
    : aiResult?.startsWith("⚠️") ? "caution"
    : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" backgroundColor="#14532d" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View className="bg-forest-900 px-5 pt-4 pb-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-5 self-start"
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color="#FFF" strokeWidth={2.5} />
            <Text className="text-white text-sm ml-0.5 font-semibold">Back</Text>
          </TouchableOpacity>

          <View className="flex-row items-end justify-between">
            <View>
              <View className="flex-row items-center gap-2 mb-1">
                <Car size={20} color="#fff" strokeWidth={1.8} />
                <Text className="text-white text-2xl font-bold tracking-tight">
                  Vehicle Check
                </Text>
              </View>
              <Text className="text-forest-300 text-sm">
                AI-powered route & vehicle safety
              </Text>
            </View>
            <View className="bg-white/15 border border-white/25 rounded-2xl px-3 py-1.5 mb-1">
              <Text className="text-white/80 text-xs font-semibold">AI Powered</Text>
            </View>
          </View>
        </View>

        <View className="px-5 pt-4">

          {/* ── Live Weather (no onPress — refresh only) ──────────────── */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-7 h-7 rounded-lg bg-forest-100 items-center justify-center">
              <Text className="text-forest-700 text-xs font-bold">☁</Text>
            </View>
            <Text className="text-gray-700 text-xs font-bold uppercase tracking-widest flex-1">
              Current Weather
            </Text>
          </View>

          {/* Wrap in a plain View (not touchable) to disable navigation */}
          <View pointerEvents="box-none">
            <WeatherCard
              weather={weather}
              loading={weatherLoading}
              error={weatherError}
              onRefresh={refreshWeather}
              // no onPress — card won't navigate
            />
          </View>

          {/* ── Step 1: Select Vehicle ───────────────────────────────── */}
          <View className="flex-row items-center gap-2 mt-6 mb-3">
            <View className="w-6 h-6 bg-forest-700 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">1</Text>
            </View>
            <Car size={14} color="#374151" strokeWidth={2} />
            <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest">
              Select Your Vehicle
            </Text>
          </View>

          <View className="mb-6">
            {Array.from({ length: Math.ceil(VEHICLES.length / 2) }, (_, rowIdx) => (
              <View key={rowIdx} className="flex-row gap-3 mb-3">
                {VEHICLES.slice(rowIdx * 2, rowIdx * 2 + 2).map((v) => {
                  const isSelected = selectedVehicle === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      onPress={() => { setSelectedVehicle(v.id); setAiResult(null); }}
                      activeOpacity={0.75}
                      className={`flex-1 rounded-2xl p-4 items-center border-2 ${
                        isSelected
                          ? "bg-forest-700 border-forest-600"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-2 ${
                        isSelected ? "bg-white/20" : "bg-gray-100"
                      }`}>
                        <Car size={20} color={isSelected ? "#fff" : "#374151"} strokeWidth={1.8} />
                      </View>
                      <Text className={`text-xs font-bold text-center leading-4 ${
                        isSelected ? "text-white" : "text-gray-700"
                      }`}>
                        {v.name}
                      </Text>
                      {isSelected && (
                        <View className="mt-2 w-5 h-5 bg-white/25 rounded-full items-center justify-center">
                          <CheckCircle size={12} color="#fff" strokeWidth={2.5} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
                {VEHICLES.slice(rowIdx * 2, rowIdx * 2 + 2).length === 1 && (
                  <View className="flex-1" />
                )}
              </View>
            ))}
          </View>

          {/* ── Step 2: Select Camp ──────────────────────────────────── */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-6 h-6 bg-forest-700 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">2</Text>
            </View>
            <Flag size={14} color="#374151" strokeWidth={2} />
            <Text className="text-gray-700 text-sm font-bold uppercase tracking-widest">
              Select Destination Camp
            </Text>
          </View>

          <View
            className="bg-white rounded-2xl overflow-hidden border border-gray-100 mb-5"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
          >
            {campsitesLoading && (
              <View className="items-center py-8 gap-2">
                <ActivityIndicator size="small" color="#1f8645" />
                <Text className="text-gray-400 text-xs">Loading campsites…</Text>
              </View>
            )}
            {campsitesError && !campsitesLoading && (
              <View className="items-center py-8 gap-2">
                <WifiOff size={24} color="#94a3b8" strokeWidth={1.8} />
                <Text className="text-gray-400 text-sm">{campsitesError}</Text>
              </View>
            )}
            {!campsitesLoading && !campsitesError && campsites.length === 0 && (
              <View className="items-center py-8 gap-2">
                <Tent size={24} color="#94a3b8" strokeWidth={1.8} />
                <Text className="text-gray-400 text-sm">No campsites available</Text>
              </View>
            )}
            {!campsitesLoading && !campsitesError && campsites.map((campsite, idx) => (
              <CampSelectorCard
                key={campsite.id}
                campsite={campsite}
                isSelected={selectedCamp === String(campsite.id)}
                isLast={idx === campsites.length - 1}
                onPress={() => { setSelectedCamp(String(campsite.id)); setAiResult(null); }}
              />
            ))}
          </View>

          {/* ── Get AI Recommendation ────────────────────────────────── */}
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mb-5 flex-row justify-center ${
              canSubmit ? "bg-blue-600" : "bg-gray-100"
            }`}
            onPress={getAIRecommendation}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white text-sm font-bold ml-2">Analyzing…</Text>
              </>
            ) : (
              <>
                <Sparkles size={16} color={canSubmit ? "#fff" : "#9ca3af"} strokeWidth={2} />
                <Text className={`text-sm font-bold ml-2 ${canSubmit ? "text-white" : "text-gray-400"}`}>
                  Get AI Recommendation
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── AI Result ────────────────────────────────────────────── */}
          {aiResult && (
            <View
              className={`rounded-2xl mb-5 overflow-hidden border ${
                resultType === "safe"    ? "border-green-200" :
                resultType === "danger"  ? "border-red-200"   :
                resultType === "caution" ? "border-amber-200" :
                "border-blue-100"
              }`}
            >
              <View
                className={`flex-row items-center gap-2.5 px-4 py-3 ${
                  resultType === "safe"    ? "bg-green-50"  :
                  resultType === "danger"  ? "bg-red-50"    :
                  resultType === "caution" ? "bg-amber-50"  :
                  "bg-blue-50"
                }`}
              >
                {resultType === "safe"    && <CheckCircle   size={16} color="#16a34a" strokeWidth={2} />}
                {resultType === "danger"  && <XCircle       size={16} color="#dc2626" strokeWidth={2} />}
                {resultType === "caution" && <AlertTriangle size={16} color="#d97706" strokeWidth={2} />}
                {!resultType              && <Bot           size={16} color="#2563eb" strokeWidth={2} />}
                <Text
                  className={`text-xs font-bold uppercase tracking-widest flex-1 ${
                    resultType === "safe"    ? "text-green-700"  :
                    resultType === "danger"  ? "text-red-700"    :
                    resultType === "caution" ? "text-amber-700"  :
                    "text-blue-700"
                  }`}
                >
                  AI Safety Recommendation
                </Text>
                <Bot size={14} color="#9ca3af" strokeWidth={1.8} />
              </View>
              <View className="bg-white px-4 py-4">
                <Text className="text-gray-800 text-sm leading-6">{aiResult}</Text>
              </View>
            </View>
          )}

          {/* ── Vehicle Restrictions ─────────────────────────────────── */}
          {selectedVehicleData && (
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-7 h-7 bg-amber-100 rounded-xl items-center justify-center">
                  <AlertTriangle size={14} color="#d97706" strokeWidth={2} />
                </View>
                <Text className="text-amber-800 text-sm font-bold">
                  {selectedVehicleData.name} Restrictions
                </Text>
              </View>
              {selectedVehicleData.restrictions.map((r, i) => (
                <View key={i} className="flex-row items-start gap-2 mb-1.5">
                  <XCircle size={12} color="#d97706" strokeWidth={2} style={{ marginTop: 2 }} />
                  <Text className="text-amber-700 text-xs leading-5 flex-1">{r}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}