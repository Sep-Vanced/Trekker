import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

// ─── Destination ───────────────────────────────────────────────────────────────
const MAPANUEPE = {
  latitude: 14.9799989,
  longitude: 120.2851367,
  name: "Lake Mapanuepe",
  address: "San Marcelino, Zambales",
};

// ─── OSRM polyline decoder (same encoding as Google) ──────────────────────────
function decodePolyline(
  encoded: string
): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

// ─── Fetch road route via OSRM (100% free, no API key needed) ─────────────────
// Uses the public OSRM demo server powered by OpenStreetMap data.
// ⚠️  OSRM expects coordinates as: longitude,latitude (lon first!)
async function fetchOSRMRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ latitude: number; longitude: number }[] | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.longitude},${origin.latitude};` +
      `${destination.longitude},${destination.latitude}` +
      `?overview=full&geometries=polyline`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    return decodePolyline(data.routes[0].geometry);
  } catch {
    return null;
  }
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function totalRouteKm(route: { latitude: number; longitude: number }[]) {
  let km = 0;
  for (let i = 0; i < route.length - 1; i++)
    km += haversineKm(route[i], route[i + 1]);
  return km;
}

// ─── Pulsing GPS dot ───────────────────────────────────────────────────────────
function PulsingDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.8, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={{
          position: "absolute",
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#1f8645",
          opacity,
          transform: [{ scale: pulse }],
        }}
      />
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: "#16a34a",
          borderWidth: 2,
          borderColor: "white",
        }}
      />
    </View>
  );
}

// ─── Destination pin ───────────────────────────────────────────────────────────
function DestinationPin() {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          backgroundColor: "#f97316",
          borderRadius: 12,
          padding: 8,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Ionicons name="water" size={15} color="white" />
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#f97316",
        }}
      />
    </View>
  );
}

// ─── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: "center",
        minWidth: 72,
        marginRight: 6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
        <Ionicons name={icon} size={10} color="#86efac" />
        <Text style={{ color: "white", fontWeight: "800", fontSize: 14, lineHeight: 18 }}>
          {value}
        </Text>
      </View>
      <Text
        style={{
          color: "rgba(134,239,172,0.7)",
          fontSize: 10,
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LiveMapSection() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "denied" | "error" | "no_route"
  >("loading");
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [distanceKm, setDistanceKm] = useState<string | null>(null);
  const [durationMin, setDurationMin] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const initLocation = useCallback(async () => {
    setStatus("loading");
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") { setStatus("denied"); return; }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(coords);

      // ── Fetch road-snapped route from OSRM (free, no API key) ────────────
      const roadRoute = await fetchOSRMRoute(coords, MAPANUEPE);

      if (!roadRoute || roadRoute.length < 2) {
        setStatus("no_route");
        return;
      }

      setRoute(roadRoute);

      // Distance along actual road
      const km = totalRouteKm(roadRoute);
      setDistanceKm(km.toFixed(1));

      // Rough driving time at ~50 km/h
      setDurationMin(Math.round((km / 50) * 60).toString());

      setStatus("ready");

      // Fit map to show the full route
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([coords, MAPANUEPE], {
          edgePadding: { top: 60, right: 50, bottom: 60, left: 50 },
          animated: true,
        });
      }, 400);
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { initLocation(); }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <View
        style={{
          height: 208,
          borderRadius: 16,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <ActivityIndicator color="#1f8645" size="large" />
        <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "600" }}>
          Finding road route…
        </Text>
      </View>
    );
  }

  // ── Denied ─────────────────────────────────────────────────────────────────
  if (status === "denied") {
    return (
      <View
        style={{
          height: 160,
          borderRadius: 16,
          backgroundColor: "#fef2f2",
          borderWidth: 1,
          borderColor: "#fee2e2",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingHorizontal: 24,
        }}
      >
        <Ionicons name="location-outline" size={28} color="#f87171" />
        <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "700", textAlign: "center" }}>
          Location permission denied
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
          Enable location in Settings to see your live route.
        </Text>
      </View>
    );
  }

  // ── Error / No Route ───────────────────────────────────────────────────────
  if (status === "error" || status === "no_route") {
    return (
      <View
        style={{
          height: 160,
          borderRadius: 16,
          backgroundColor: "#fff7ed",
          borderWidth: 1,
          borderColor: "#fed7aa",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingHorizontal: 24,
        }}
      >
        <Ionicons name="warning-outline" size={26} color="#f97316" />
        <Text style={{ color: "#64748b", fontSize: 13, textAlign: "center" }}>
          {status === "no_route"
            ? "No drivable route found. Check your connection."
            : "Could not get location. Check GPS settings."}
        </Text>
        <TouchableOpacity
          onPress={initLocation}
          style={{
            marginTop: 4,
            backgroundColor: "#166534",
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format drive time nicely
  const mins = durationMin ? parseInt(durationMin) : 0;
  const driveLabel =
    mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

  return (
    <View
      style={{
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#14532d",
        shadowColor: "#052e16",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={{ width: "100%", height: 220 }}
        showsCompass
        showsScale
        showsTraffic={false}
        initialRegion={{
          latitude: location
            ? (location.latitude + MAPANUEPE.latitude) / 2
            : MAPANUEPE.latitude,
          longitude: location
            ? (location.longitude + MAPANUEPE.longitude) / 2
            : MAPANUEPE.longitude,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }}
      >
        {/* User location */}
        {location && (
          <Marker coordinate={location} title="You are here" anchor={{ x: 0.5, y: 0.5 }}>
            <PulsingDot />
          </Marker>
        )}

        {/* Destination */}
        <Marker
          coordinate={MAPANUEPE}
          title={MAPANUEPE.name}
          description={MAPANUEPE.address}
          anchor={{ x: 0.5, y: 1 }}
        >
          <DestinationPin />
        </Marker>

        {/* Road route — glow shadow */}
        {route.length > 1 && (
          <>
            <Polyline
              coordinates={route}
              strokeWidth={10}
              strokeColor="rgba(34,197,94,0.15)"
              lineJoin="round"
              lineCap="round"
              zIndex={0}
            />
            {/* Road route — solid line */}
            <Polyline
              coordinates={route}
              strokeWidth={4}
              strokeColor="#22c55e"
              lineJoin="round"
              lineCap="round"
              zIndex={1}
            />
          </>
        )}
      </MapView>

      {/* ── Destination header ────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.08)",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "#f97316",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="water" size={17} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: "white", fontWeight: "700", fontSize: 13 }}
            numberOfLines={1}
          >
            {MAPANUEPE.name}
          </Text>
          <Text
            style={{ color: "rgba(134,239,172,0.6)", fontSize: 11, marginTop: 2 }}
            numberOfLines={1}
          >
            {MAPANUEPE.address}
          </Text>
        </View>

        {/* Road route badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Ionicons name="navigate-circle-outline" size={11} color="#86efac" />
          <Text
            style={{
              color: "#86efac",
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.5,
              marginLeft: 4,
            }}
          >
            ROAD ROUTE
          </Text>
        </View>
      </View>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {distanceKm && (
          <StatChip icon="navigate" value={`${distanceKm} km`} label="Distance" />
        )}
        {durationMin && (
          <StatChip icon="time-outline" value={driveLabel} label="Drive time" />
        )}
        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={initLocation}
          activeOpacity={0.75}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#15803d",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="locate" size={14} color="white" />
          <Text style={{ color: "white", fontSize: 12, fontWeight: "700", marginLeft: 4 }}>
            Recenter
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── GPS status bar ─────────────────────────────────────────────────── */}
      {location && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "rgba(0,0,0,0.2)",
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.05)",
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#4ade80" }} />
          <Text style={{ color: "rgba(134,239,172,0.7)", fontSize: 10, fontWeight: "500" }}>
            GPS active · {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} · OSRM / OpenStreetMap
          </Text>
        </View>
      )}
    </View>
  );
}