"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix default marker icon paths (Next.js/webpack breaks Leaflet's default icon URLs)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface RouteMapClientProps {
  destLat: number;
  destLng: number;
  destName: string;
  destSubtitle?: string;
  userLat?: number;
  userLng?: number;
}

export default function RouteMapClient({
  destLat,
  destLng,
  destName,
  destSubtitle,
  userLat,
  userLng,
}: RouteMapClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const center: [number, number] = userLat && userLng ? [userLat, userLng] : [destLat, destLng];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[destLat, destLng]} icon={markerIcon}>
        <Popup>
          <strong>{destName}</strong>
          {destSubtitle && <div>{destSubtitle}</div>}
        </Popup>
      </Marker>

      {userLat && userLng && (
        <Marker position={[userLat, userLng]} icon={markerIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}