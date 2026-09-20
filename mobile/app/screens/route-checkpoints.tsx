import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { getCheckpointsByRoute } from "../../api/navigation";
import { Checkpoint } from "@/types/navigation-types";

// ─── Types ────────────────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── Checkpoint type config ───────────────────────────────────────────────────
const CP_TYPE_CONFIG: Record<string, {
  accent: string; glow: string; icon: IoniconName; label: string; gradient: [string, string];
}> = {
  waypoint:  { accent: "#3b82f6", glow: "rgba(59,130,246,0.35)",  icon: "flag",    label: "Waypoint",  gradient: ["#1d4ed8", "#3b82f6"] },
  danger:    { accent: "#ef4444", glow: "rgba(239,68,68,0.35)",   icon: "warning", label: "Danger",    gradient: ["#b91c1c", "#ef4444"] },
  rest:      { accent: "#06b6d4", glow: "rgba(6,182,212,0.35)",   icon: "cafe",    label: "Rest Stop", gradient: ["#0e7490", "#06b6d4"] },
  camp:      { accent: "#22c55e", glow: "rgba(34,197,94,0.35)",   icon: "bonfire", label: "Camp",      gradient: ["#15803d", "#22c55e"] },
  emergency: { accent: "#f97316", glow: "rgba(249,115,22,0.35)",  icon: "medkit",  label: "Emergency", gradient: ["#c2410c", "#f97316"] },
};
const getCpConfig = (cpType: string) => CP_TYPE_CONFIG[cpType.toLowerCase()] ?? CP_TYPE_CONFIG.waypoint;

const DIFFICULTY_CONFIG: Record<string, { accent: string; label: string; gradient: [string, string] }> = {
  easy:     { accent: "#22c55e", label: "Easy",     gradient: ["#15803d", "#22c55e"] },
  moderate: { accent: "#3b82f6", label: "Moderate", gradient: ["#1d4ed8", "#3b82f6"] },
  hard:     { accent: "#f97316", label: "Hard",     gradient: ["#c2410c", "#f97316"] },
  expert:   { accent: "#ef4444", label: "Expert",   gradient: ["#b91c1c", "#ef4444"] },
};
const getDiffConfig = (d: string) => DIFFICULTY_CONFIG[d.toLowerCase()] ?? DIFFICULTY_CONFIG.moderate;

// ─── Map HTML ─────────────────────────────────────────────────────────────────
function buildMapHtml(checkpoints: Checkpoint[], initialActiveId: number | null): string {
  const markersJson = JSON.stringify(
    checkpoints.map((cp) => ({
      id: cp.id, order: cp.order,
      lat: parseFloat(cp.latitude), lng: parseFloat(cp.longitude),
      name: cp.name, type: cp.cp_type,
      color: getCpConfig(cp.cp_type).accent, mandatory: cp.is_mandatory,
    }))
  );
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%;overflow:hidden;background:#dde8d8}
    .leaflet-control-attribution,.leaflet-control-zoom{display:none}
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var DATA=${markersJson}, INIT=${initialActiveId ?? "null"};
  var map, markers={}, activeId=INIT;
  map=L.map("map",{zoomControl:false,attributionControl:false,tap:true});
  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{maxZoom:17}).addTo(map);
  var lls=DATA.map(function(m){return[m.lat,m.lng]});
  if(lls.length>1){
    L.polyline(lls,{color:"rgba(0,0,0,0.2)",weight:6}).addTo(map);
    L.polyline(lls,{color:"white",weight:3,dashArray:"8 5"}).addTo(map);
  }
  function makeIcon(d,active){
    var s=active?42:30,ring=active?'<div style="position:absolute;inset:-5px;border-radius:50%;border:2px solid '+d.color+';opacity:0.4;animation:pulse 2s infinite"></div>':'';
    return L.divIcon({className:"",iconSize:[s,s],iconAnchor:[s/2,s/2],
      html:'<div style="position:relative;width:'+s+'px;height:'+s+'px">'+ring+
           '<div style="position:absolute;inset:0;border-radius:50%;background:'+d.color+
           ';border:'+(active?'2.5px':'2px')+' solid rgba(255,255,255,'+(active?1.0:0.7)+');color:white;font-weight:900;font-size:'+(active?14:10)+'px;'+
           'font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;'+
           'box-shadow:0 0 '+(active?20:8)+'px '+d.color+','+(active?'0 0 40px '+d.color+'44,':'')+
           '0 4px 12px rgba(0,0,0,0.6)">'+d.order+'</div></div>'});
  }
  function focusMarker(id,fromMap){
    if(activeId!==null&&markers[activeId]){
      var p=DATA.find(function(m){return m.id===activeId});
      if(p)markers[activeId].setIcon(makeIcon(p,false));
    }
    activeId=id;
    var f=DATA.find(function(m){return m.id===id});
    if(!f)return;
    markers[id].setIcon(makeIcon(f,true));
    markers[id].setZIndexOffset(1000);
    map.panTo([f.lat,f.lng],{animate:true,duration:0.4});
    if(fromMap&&window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(JSON.stringify({type:"markerClick",id:id}));
  }
  DATA.forEach(function(d){
    var m=L.marker([d.lat,d.lng],{icon:makeIcon(d,d.id===INIT),zIndexOffset:d.id===INIT?1000:0}).addTo(map);
    m.on("click",function(){focusMarker(d.id,true)});
    markers[d.id]=m;
  });
  if(DATA.length===1)map.setView([DATA[0].lat,DATA[0].lng],15);
  else if(DATA.length>1)map.fitBounds(lls,{padding:[50,50],maxZoom:15});
  function handleRNMessage(raw){try{var msg=JSON.parse(raw);if(msg.type==="focusMarker")focusMarker(msg.id,false)}catch(_){}}
  document.addEventListener("message",function(e){handleRNMessage(e.data)});
  window.addEventListener("message",function(e){handleRNMessage(e.data)});
</script>
</body>
</html>`;
}

// ─── Shimmer ──────────────────────────────────────────────────────────────────
function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.65] });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  const opacity = useShimmer();
  return (
    <Animated.View style={{ opacity }} className="px-4 mb-3">
      <View className="bg-[#e8ede8] rounded-[20px] p-4 border border-black/[0.06]">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-9 h-9 rounded-full bg-black/[0.08]" />
          <View className="flex-1">
            <View className="h-[13px] w-[65%] bg-black/[0.08] rounded-md mb-1.5" />
            <View className="h-[10px] w-[40%] bg-black/[0.06] rounded" />
          </View>
        </View>
        <View className="h-[10px] bg-black/[0.06] rounded mb-[5px]" />
        <View className="h-[10px] w-3/4 bg-black/[0.06] rounded" />
      </View>
    </Animated.View>
  );
}

// ─── Alert box ────────────────────────────────────────────────────────────────
function AlertBox({ message, accent }: { message: string; accent: string }) {
  return (
    <View
      style={{
        borderColor: accent + "30",
        backgroundColor: accent + "14",
      }}
      className="flex-row items-start gap-2 rounded-xl p-2.5 mt-2.5 border"
    >
      <View
        style={{ backgroundColor: accent + "25" }}
        className="w-5 h-5 rounded-full items-center justify-center shrink-0 mt-px"
      >
        <Ionicons name="megaphone" size={10} color={accent} />
      </View>
      <Text style={{ color: accent }} className="flex-1 text-[11px] leading-4 font-medium">
        {message}
      </Text>
    </View>
  );
}

// ─── Checkpoint card ──────────────────────────────────────────────────────────
function CheckpointCard({ checkpoint, isLast, isActive, onPress }: {
  checkpoint: Checkpoint; isLast: boolean; isActive: boolean; onPress: () => void;
}) {
  const cp = getCpConfig(checkpoint.cp_type);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const jsAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(jsAnim, { toValue: isActive ? 1 : 0, useNativeDriver: false, tension: 60, friction: 12 }).start();
    if (isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 12 }),
      ]).start();
    }
  }, [isActive]);

  const borderColor = jsAnim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(0,0,0,0.07)", cp.accent + "55"] });

  return (
    <View className="flex-row px-4 gap-3">
      {/* Timeline */}
      <View className="items-center w-9">
        <View
          style={isActive ? {
            backgroundColor: cp.accent,
            shadowColor: cp.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 12,
            elevation: 8,
          } : {
            backgroundColor: cp.accent + "20",
            borderWidth: 1.5,
            borderColor: cp.accent + "40",
          }}
          className="w-9 h-9 rounded-full items-center justify-center"
        >
          <Text style={{ color: isActive ? "white" : cp.accent }} className="text-xs font-extrabold">
            {checkpoint.order}
          </Text>
        </View>
        {!isLast && (
          <View
            style={{ backgroundColor: isActive ? cp.accent + "45" : cp.accent + "20" }}
            className="w-[1.5px] flex-1 mt-1 min-h-4 rounded-sm"
          />
        )}
      </View>

      {/* Card */}
      <Animated.View style={{ flex: 1, marginBottom: 12, transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.88}
          style={{
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: cp.accent,
            shadowOffset: { width: 0, height: isActive ? 6 : 2 },
            shadowOpacity: isActive ? 0.4 : 0,
            shadowRadius: 16,
            elevation: isActive ? 6 : 2,
          }}
        >
          <Animated.View
            style={{ backgroundColor: "#ffffff", borderRadius: 20, borderWidth: 1.5, borderColor }}
          >
            {/* Top accent strip */}
            {isActive && (
              <View style={{ height: 2, backgroundColor: cp.accent }} className="w-full opacity-90" />
            )}

            <View className="p-[14px]">
              {/* Header row */}
              <View className="flex-row items-start mb-2.5">
                {/* Icon badge */}
                <View
                  style={{ backgroundColor: isActive ? cp.accent + "25" : cp.accent + "18" }}
                  className="w-8 h-8 rounded-[10px] items-center justify-center mr-2.5 shrink-0"
                >
                  <Ionicons name={cp.icon} size={15} color={cp.accent} />
                </View>

                <View className="flex-1">
                  <Text className="text-[13px] font-bold text-[#0f1f0f] leading-[18px] mb-[3px]" numberOfLines={2}>
                    {checkpoint.name}
                  </Text>
                  {/* Pills */}
                  <View className="flex-row gap-1.5 flex-wrap">
                    <View
                      style={{ backgroundColor: cp.accent + "18", borderColor: cp.accent + "28" }}
                      className="flex-row items-center gap-1 px-[7px] py-[3px] rounded-full border"
                    >
                      <Text style={{ color: cp.accent }} className="text-[10px] font-bold">{cp.label}</Text>
                    </View>
                    {checkpoint.is_mandatory && (
                      <View className="flex-row items-center gap-1 px-[7px] py-[3px] rounded-full bg-amber-400/15 border border-amber-400/25">
                        <View className="w-[5px] h-[5px] rounded-full bg-amber-400" />
                        <Text className="text-[10px] font-bold text-amber-400">Required</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Focus button */}
                <View
                  style={{
                    backgroundColor: isActive ? cp.accent + "18" : "rgba(0,0,0,0.04)",
                    borderColor: isActive ? cp.accent + "40" : "rgba(0,0,0,0.08)",
                  }}
                  className="w-7 h-7 rounded-full items-center justify-center ml-1.5 border"
                >
                  <Ionicons
                    name={isActive ? "locate" : "locate-outline"}
                    size={13}
                    color={isActive ? cp.accent : "rgba(15,31,15,0.35)"}
                  />
                </View>
              </View>

              {/* Description */}
              <Text
                className="text-xs text-[rgba(15,31,15,0.55)] leading-[18px]"
                numberOfLines={isActive ? 5 : 2}
              >
                {checkpoint.description}
              </Text>

              {/* Alert */}
              {isActive && checkpoint.alert_message && (
                <AlertBox message={checkpoint.alert_message} accent={cp.accent} />
              )}

              {/* Footer coords */}
              <View className="flex-row items-center gap-1 mt-2.5 pt-2.5 border-t border-black/[0.06]">
                <Ionicons name="navigate-outline" size={10} color="rgba(15,31,15,0.35)" />
                <Text className="text-[10px] text-[rgba(15,31,15,0.35)] font-medium flex-1" numberOfLines={1}>
                  {parseFloat(checkpoint.latitude).toFixed(5)}°, {parseFloat(checkpoint.longitude).toFixed(5)}°
                </Text>
                <View className="flex-row items-center gap-[3px]">
                  <View style={{ backgroundColor: cp.accent + "60" }} className="w-1 h-1 rounded-full" />
                  <Text className="text-[10px] text-[rgba(15,31,15,0.35)] font-medium">
                    {checkpoint.radius_meters}m radius
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="m-4 rounded-2xl bg-red-500/10 border border-red-500/25 p-[14px] flex-row items-center gap-2.5">
      <View className="w-8 h-8 rounded-full bg-red-500/15 items-center justify-center">
        <Ionicons name="alert-circle" size={16} color="#ef4444" />
      </View>
      <Text className="flex-1 text-xs text-red-300 font-medium">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="px-3 py-1.5 rounded-[10px] bg-red-500/20 border border-red-500/30"
      >
        <Text className="text-[11px] text-red-400 font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-16 h-16 rounded-[22px] bg-green-700/[0.08] items-center justify-center mb-3.5 border border-green-700/15">
        <Ionicons name="flag-outline" size={28} color="rgba(15,31,15,0.35)" />
      </View>
      <Text className="text-[15px] font-bold text-[rgba(15,31,15,0.55)]">No checkpoints yet</Text>
      <Text className="text-xs text-[rgba(15,31,15,0.35)] mt-[5px] text-center leading-[18px]">
        This route hasn't been set up with checkpoints.
      </Text>
    </View>
  );
}

// ─── Active strip ─────────────────────────────────────────────────────────────
function ActiveStrip({ checkpoint, total, onPrev, onNext }: {
  checkpoint: Checkpoint | null; total: number; onPrev: () => void; onNext: () => void;
}) {
  if (!checkpoint) return null;
  const cp = getCpConfig(checkpoint.cp_type);
  const progress = checkpoint.order / total;

  return (
    <View className="bg-white border-t border-black/[0.07]">
      {/* Progress bar */}
      <View className="h-[2px] bg-black/[0.06]">
        <View style={{ width: `${progress * 100}%`, backgroundColor: cp.accent }} className="h-[2px] rounded-[1px]" />
      </View>

      <View className="flex-row items-center px-3 py-2.5 gap-2.5">
        <TouchableOpacity
          onPress={onPrev}
          className="w-9 h-9 rounded-full items-center justify-center bg-black/5 border border-black/[0.08]"
        >
          <Ionicons
            name="chevron-back"
            size={17}
            color={checkpoint.order > 1 ? "#0f1f0f" : "rgba(15,31,15,0.35)"}
          />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center gap-2.5 bg-black/[0.03] rounded-2xl px-3 py-2 border border-black/[0.07]">
          <View
            style={{
              backgroundColor: cp.accent,
              shadowColor: cp.accent,
              shadowOpacity: 0.5,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
            }}
            className="w-[30px] h-[30px] rounded-full items-center justify-center shrink-0"
          >
            <Text className="text-white text-[11px] font-black">{checkpoint.order}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-[#0f1f0f]" numberOfLines={1}>{checkpoint.name}</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View
                style={{ backgroundColor: cp.accent + "20" }}
                className="flex-row items-center gap-[3px] px-1.5 py-0.5 rounded-lg"
              >
                <Ionicons name={cp.icon} size={8} color={cp.accent} />
                <Text style={{ color: cp.accent }} className="text-[9px] font-bold">{cp.label}</Text>
              </View>
              {checkpoint.is_mandatory && (
                <Text className="text-[9px] text-amber-600 font-bold">• Required</Text>
              )}
              <Text className="text-[9px] text-[rgba(15,31,15,0.35)] ml-auto">
                {checkpoint.order} / {total}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={onNext}
          className="w-9 h-9 rounded-full items-center justify-center bg-black/5 border border-black/[0.08]"
        >
          <Ionicons
            name="chevron-forward"
            size={17}
            color={checkpoint.order < total ? "#0f1f0f" : "rgba(15,31,15,0.35)"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Map loading skeleton ──────────────────────────────────────────────────────
function MapSkeleton() {
  const opacity = useShimmer();
  return (
    <View className="flex-1 bg-[#e8f0e8] items-center justify-center gap-2">
      <Animated.View style={{ opacity }}>
        <View className="w-12 h-12 rounded-full bg-black/[0.07] items-center justify-center">
          <Ionicons name="map-outline" size={22} color="rgba(0,0,0,0.25)" />
        </View>
      </Animated.View>
      <Text className="text-[11px] text-black/30 font-medium">Loading map…</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RouteCheckpoints() {
  const router = useRouter();
  const webviewRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const { routeId, routeName, routeDifficulty } = useLocalSearchParams<{
    routeId: string; routeName: string; routeDifficulty: string;
  }>();

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mapHtml, setMapHtml] = useState<string>("");

  const decodedName = routeName ? decodeURIComponent(routeName) : "Route";
  const decodedDifficulty = routeDifficulty ? decodeURIComponent(routeDifficulty) : "moderate";
  const diffConfig = getDiffConfig(decodedDifficulty);

  // const unique = (data: Checkpoint[]) => {
  //   const seen = new Set<number>();
  //   return data.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
  // };

  const unique = (data: Checkpoint[]) => {
  const seen = new Set<string>();
  return data.filter((c) => {
    const key = `${c.order}-${c.name}-${c.latitude}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

  const fetchCheckpoints = async () => {
    if (!routeId) return;
    try {
      setLoading(true); setError(null);
      const res = await getCheckpointsByRoute(Number(routeId));
      const data = unique(res.data).sort((a, b) => a.order - b.order);
      setCheckpoints(data);
      if (data.length > 0) {
        setActiveId(data[0].id);
        setMapHtml(buildMapHtml(data, data[0].id));
      }
    } catch {
      setError("Failed to load checkpoints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCheckpoints(); }, [routeId]);

  const focusCheckpoint = useCallback((id: number) => {
    setActiveId(id);
    webviewRef.current?.injectJavaScript(`handleRNMessage('${JSON.stringify({ type: "focusMarker", id })}');true;`);
    const idx = checkpoints.findIndex((c) => c.id === id);
    if (idx !== -1) flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.15 });
  }, [checkpoints]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "markerClick") {
        setActiveId(msg.id);
        const idx = checkpoints.findIndex((c) => c.id === msg.id);
        if (idx !== -1) flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.15 });
      }
    } catch (_) {}
  }, [checkpoints]);

  const activeIndex = checkpoints.findIndex((c) => c.id === activeId);
  const activeCheckpoint = activeIndex !== -1 ? checkpoints[activeIndex] : null;

  const goToPrev = useCallback(() => {
    if (activeIndex > 0) focusCheckpoint(checkpoints[activeIndex - 1].id);
  }, [activeIndex, checkpoints, focusCheckpoint]);

  const goToNext = useCallback(() => {
    if (activeIndex < checkpoints.length - 1) focusCheckpoint(checkpoints[activeIndex + 1].id);
  }, [activeIndex, checkpoints, focusCheckpoint]);

  const mandatoryCount = checkpoints.filter((c) => c.is_mandatory).length;
  const dangerCount = checkpoints.filter((c) => c.cp_type === "danger" || c.cp_type === "emergency").length;
  const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.36);

  const renderItem = useCallback(({ item, index }: { item: Checkpoint; index: number }) => (
    <CheckpointCard
      checkpoint={item}
      isLast={index === checkpoints.length - 1}
      isActive={item.id === activeId}
      onPress={() => focusCheckpoint(item.id)}
    />
  ), [checkpoints.length, activeId, focusCheckpoint]);

  const ListHeader = () => (
    <View className="flex-row items-center px-4 pt-4 pb-2.5 gap-2">
      <View className="w-6 h-6 rounded-lg bg-green-700/[0.12] items-center justify-center border border-green-700/15">
        <Ionicons name="git-branch-outline" size={12} color="#22c55e" />
      </View>
      <Text className="text-[10px] font-bold text-[rgba(15,31,15,0.35)] uppercase tracking-[1.5px] flex-1">
        Route Timeline
      </Text>
      <View className="flex-row items-center gap-1 px-2 py-[3px] rounded-[10px] bg-black/5 border border-black/[0.08]">
        <Ionicons name="flag" size={9} color="rgba(15,31,15,0.55)" />
        <Text className="text-[10px] font-bold text-[rgba(15,31,15,0.55)]">{checkpoints.length} stops</Text>
      </View>
    </View>
  );

  const ListFooter = () => (
    <View className="px-4 pb-7 pt-2">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/screens/trek-start?routeId=${routeId}`)}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          shadowColor: diffConfig.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={diffConfig.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 }}
        >
          <Ionicons name="navigate" size={16} color="white" />
          <Text className="text-white text-sm font-extrabold tracking-[0.3px]">Begin This Route</Text>
          <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f0f4f0]" edges={["top"]}>
      <StatusBar style="light" backgroundColor="#14532d" translucent />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View className="px-4 pb-5 bg-green-900">
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-3 self-start bg-white/20 px-3 py-1.5 rounded-2xl"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          <Text className="text-[13px] font-semibold ml-2" style={{ color: "#FFFFFF" }}>Back to Routes</Text>
        </TouchableOpacity>

        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2.5">
            <Text className="text-[10px] font-semibold text-white/50 uppercase tracking-[1.2px] mb-1">
              Checkpoints
            </Text>
            <Text className="text-lg font-extrabold text-white tracking-tight" numberOfLines={3}>
              {decodedName}
            </Text>
          </View>

          {/* Right side stats */}
          {!loading && checkpoints.length > 0 && (
            <View className="flex-row gap-1.5 flex-wrap justify-end max-w-[120px]">
              {/* Difficulty */}
              <View
                style={{ backgroundColor: diffConfig.accent + "20", borderColor: diffConfig.accent + "35" }}
                className="px-2 py-1 rounded-[10px] border"
              >
                <Text style={{ color: diffConfig.accent }} className="text-[10px] font-bold">{diffConfig.label}</Text>
              </View>
              {mandatoryCount > 0 && (
                <View className="flex-row items-center px-2 py-1 rounded-[10px] bg-amber-400/15 border border-amber-400/25">
                  <Ionicons name="alert" size={9} color="#fbbf24" />
                  <Text className="text-[10px] font-bold text-amber-400 ml-0.5">{mandatoryCount}</Text>
                </View>
              )}
              {dangerCount > 0 && (
                <View className="flex-row items-center gap-1 px-2 py-1 rounded-[10px] bg-red-500/15 border border-red-500/25">
                  <Ionicons name="warning" size={9} color="#f87171" />
                  <Text className="text-[10px] font-bold text-red-400">{dangerCount}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* ── Map ────────────────────────────────────────────────────────── */}
      <View
        style={{ height: MAP_HEIGHT }}
        className="bg-[#e8f0e8] border-b border-black/[0.06]"
      >
        {loading ? <MapSkeleton /> : error ? null : mapHtml ? (
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
            {/* Legend */}
            <View
              className="absolute top-2.5 left-2.5 bg-white/60 rounded-xl p-2.5 border border-black/[0.08]"
              pointerEvents="none"
            >
              {Object.entries(CP_TYPE_CONFIG).map(([key, val]) => (
                <View key={key} className="flex-row items-center gap-1.5 p-0.5">
                  <View style={{ backgroundColor: val.accent }} className="w-[7px] h-[7px] rounded-[3.5px]" />
                  <Text className="text-[rgba(15,31,15,0.75)] text-[9px] font-semibold">{val.label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>

      {/* ── Active strip ──────────────────────────────────────────────── */}
      {!loading && !error && checkpoints.length > 0 && (
        <ActiveStrip
          checkpoint={activeCheckpoint}
          total={checkpoints.length}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}

      {/* ── Checkpoint list ───────────────────────────────────────────── */}
      <View className="flex-1 bg-[#f0f4f0]">
        {loading && (
          <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </ScrollView>
        )}
        {error && !loading && <ErrorBanner message={error} onRetry={fetchCheckpoints} />}
        {!loading && !error && checkpoints.length === 0 && <EmptyState />}
        {!loading && !error && checkpoints.length > 0 && (
          <FlatList
            ref={flatListRef}
            data={checkpoints}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.15 });
              }, 300);
            }}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}