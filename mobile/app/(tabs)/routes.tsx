import {
  View,
  Text,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { getCampsites } from "../../api/navigation";
import { Campsite } from "@/types/navigation-types";
import { buildMapHtml } from "@/components/campsites/CampsiteMap";
import { PHASE_CONFIG } from "@/utils/phase-config";
import { CampsiteCard } from "@/components/campsites/CampsiteCard";
import { MapSkeleton } from "@/components/campsites/MapSkeleton";
import { LegendDot } from "@/components/campsites/LegendDot";
import { NavStrip } from "@/components/campsites/NavStrip";
import { SkeletonCard } from "@/components/campsites/SkeletonCard";
import { ErrorBanner } from "@/components/campsites/ErrorBanner";
import { EmptyState } from "@/components/campsites/EmptyState";


const { height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function Routes() {
  const router      = useRouter();
  const webviewRef  = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const [campsites,  setCampsites]  = useState<Campsite[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [activeId,   setActiveId]   = useState<number | null>(null);
  const [mapHtml,    setMapHtml]    = useState<string>("");
  const [mapVisible, setMapVisible] = useState(true);
  const mapAnim = useRef(new Animated.Value(1)).current;

  const toggleMap = useCallback(() => {
    const next = !mapVisible;
    setMapVisible(next);
    Animated.spring(mapAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      tension: 65,
      friction: 14,
    }).start();
  }, [mapVisible, mapAnim]);

  const fetchCampsites = async () => {
    try {
      setLoading(true); setError(null);
      const res  = await getCampsites();
      const data = res.data.filter((c) => c.is_active);
      setCampsites(data);
      if (data.length > 0) {
        setActiveId(data[0].id);
        setMapHtml(buildMapHtml(data, data[0].id));
      }
    } catch {
      setError("Failed to load campsites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampsites(); }, []);

  const focusCampsite = useCallback((id: number) => {
    setActiveId(id);
    webviewRef.current?.injectJavaScript(
      `handleRNMessage('${JSON.stringify({ type: "focusMarker", id })}');true;`
    );
  }, []);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "markerClick") {
        setActiveId(msg.id);
        const idx = campsites.findIndex((c) => c.id === msg.id);
        if (idx !== -1)
          flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.1 });
      }
    } catch (_) {}
  }, [campsites]);

  const activeIndex    = campsites.findIndex((c) => c.id === activeId);
  const activeCampsite = activeIndex !== -1 ? campsites[activeIndex] : null;

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) focusCampsite(campsites[activeIndex - 1].id);
  }, [activeIndex, campsites, focusCampsite]);

  const goToNext = useCallback(() => {
    if (activeIndex < campsites.length - 1) focusCampsite(campsites[activeIndex + 1].id);
  }, [activeIndex, campsites, focusCampsite]);

  const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.37);
  const animatedMapHeight = mapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, MAP_HEIGHT],
  });
  const mapOpacity = mapAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  const uniquePhases = Object.keys(PHASE_CONFIG).filter((p) =>
    campsites.some((c) => c.phase === p)
  );

  const renderItem = useCallback(({ item }: { item: Campsite }) => (
    <CampsiteCard
      campsite={item}
      isActive={item.id === activeId}
      onFocus={() => focusCampsite(item.id)}
      onSelect={() =>
        router.push(
          `/screens/campsite-routes?campsiteId=${item.id}&campsiteName=${encodeURIComponent(item.name)}&campsitePhase=${encodeURIComponent(item.phase)}`
        )
      }
    />
  ), [activeId, focusCampsite, router]);

  const ListHeader = () => (
    <View className="flex-row items-center px-4 pt-4 pb-2.5 gap-2">
      <View className="w-[26px] h-[26px] rounded-lg bg-[#1f8645]/[0.08] border border-[#1f8645]/[0.13] items-center justify-center">
        <Ionicons name="bonfire" size={13} color="#1f8645" />
      </View>
      <Text className="text-[10px] font-extrabold text-black/40 tracking-[1.5px] uppercase flex-1">
        Available Campsites
      </Text>
      <View className="flex-row items-center gap-1 px-2 py-[3px] rounded-[10px] bg-black/[0.04] border border-black/[0.07]">
        <Ionicons name="layers" size={9} color="rgba(0,0,0,0.4)" />
        <Text className="text-[10px] font-bold text-black/40">{campsites.length} sites</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f0f4f0]" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#0a1f0a" translucent />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <View className="bg-green-900 px-4 py-6">
        <View className="flex-row items-end justify-between">
          <View >
            <Text className="text-green-300 uppercase font-semibold text-xs">Explore</Text>
            <Text className="text-white text-2xl font-semibold tracking-tight">
              Campsites
            </Text>
            <Text className="text-white text-xs mt-1">
              Select your camp destination
            </Text>
          </View>

          {/* Stats cluster */}
          {!loading && campsites.length > 0 && (
            <View className="items-end gap-1.5">
              <View className="flex-row items-center bg-white/[0.08] rounded-xl px-2.5 py-[5px] border border-white/10">
                <Ionicons name="map" size={11} color="rgba(255,255,255,0.6)" />
                <Text className="text-white/70 text-[11px] font-bold ml-1">
                  {campsites.length} camps
                </Text>
              </View>
              <View className="flex-row gap-1">
                {uniquePhases.slice(0, 4).map((p) => (
                  <View
                    key={p}
                    style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: PHASE_CONFIG[p].mapColor,
                      shadowColor: PHASE_CONFIG[p].mapColor,
                      shadowOpacity: 0.6, shadowRadius: 4,
                      shadowOffset: { width: 0, height: 0 }, elevation: 2,
                    }}
                  />
                ))}
                {uniquePhases.length > 4 && (
                  <Text className="text-white/30 text-[9px]">+{uniquePhases.length - 4}</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── Map (animated show/hide) ──────────────────────────────────── */}
      <Animated.View style={{ height: animatedMapHeight, backgroundColor: "#e4ede4", overflow: "hidden" }}>
        <Animated.View style={{ flex: 1, opacity: mapOpacity }}>
          {loading ? (
            <MapSkeleton />
          ) : error ? null : mapHtml ? (
            <>
              <WebView
                ref={webviewRef}
                source={{ html: mapHtml }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                javaScriptEnabled
                domStorageEnabled
                onMessage={handleWebViewMessage}
              />

              {/* Phase legend */}
              {uniquePhases.length > 0 && (
                <View
                  className="absolute top-2.5 left-2.5 bg-white/60 rounded-lg px-2.5 py-2 gap-[6px] border border-black/[0.07]"
                  pointerEvents="none"
                >
                  {uniquePhases.map((p) => (
                    <LegendDot key={p} phase={p} color={PHASE_CONFIG[p].mapColor} />
                  ))}
                </View>
              )}

              {/* GPS badge */}
              <View
                className="absolute bottom-2.5 right-2.5 flex-row items-center gap-[5px] bg-[rgba(10,31,10,0.82)] rounded-full px-2.5 py-1.5"
                pointerEvents="none"
              >
                <View className="w-1.5 h-1.5 rounded-full bg-[#4caf72]" />
                <Text className="text-[#a8e6b8] text-[10px] font-semibold">
                  {campsites.length} camps plotted
                </Text>
              </View>
            </>
          ) : null}
        </Animated.View>
      </Animated.View>

      {/* ── Nav strip ────────────────────────────────────────────────── */}
      {!loading && !error && campsites.length > 0 && (
        <NavStrip
          campsite={activeCampsite}
          total={campsites.length}
          activeIndex={activeIndex}
          onPrev={goToPrev}
          onNext={goToNext}
          mapVisible={mapVisible}
          onToggleMap={toggleMap}
        />
      )}

      {/* ── Campsite list ─────────────────────────────────────────────── */}
      <View className="flex-1 bg-white">
        {loading && (
          <ScrollView contentContainerStyle={{ paddingTop: 14 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </ScrollView>
        )}
        {error && !loading && (
          <View className="pt-1">
            <ErrorBanner message={error} onRetry={fetchCampsites} />
          </View>
        )}
        {!loading && !error && campsites.length === 0 && <EmptyState />}
        {!loading && !error && campsites.length > 0 && (
          <>
          <View className="flex-row items-center px-4 py-2">
            <View className="w-[26px] h-[26px] rounded-lg bg-[#1f8645]/[0.08] border border-[#1f8645]/[0.13] items-center justify-center mr-2">
              <Ionicons name="bonfire" size={13} color="#1f8645" />
            </View>
            <Text className="text-[10px] font-extrabold text-black/40 tracking-[1.5px] uppercase flex-1">
              Available Campsites
            </Text>
            <View className="flex-row items-center px-2 py-[3px] rounded-[10px] bg-black/[0.04] border border-black/[0.07]">
              <Ionicons name="layers" size={9} color="rgba(0,0,0,0.4)" />
              <Text className="text-[10px] font-bold text-black/40 ml-1">{campsites.length} sites</Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={campsites}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            //ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index, animated: true, viewPosition: 0.1,
                });
              }, 300);
            }}
            contentContainerStyle={{ paddingBottom: 28 }}
          />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}