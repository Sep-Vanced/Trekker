"use client";

import { Campsite } from "@/types/navigation-types";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { PHASE_CONFIG } from "./PhaseConfig";

function createMarkerIcon(color: string, active: boolean) {
  return divIcon({
    className: "",
    iconSize: [active ? 44 : 32, active ? 44 : 32],
    iconAnchor: [active ? 22 : 16, active ? 22 : 16],
    html: `<div style="position:relative;width:${active ? 44 : 32}px;height:${active ? 44 : 32}px">
      <div style="position:absolute;inset:0;border-radius:50%;background:${color};border:${active ? 3 : 2}px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 0 ${active ? 20 : 8}px ${color},0 4px 12px rgba(0,0,0,0.5)">
        <svg width="${active ? 18 : 13}" height="${active ? 18 : 13}" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div></div>`,
  });
}

export default function CampsiteMapClient({
  campsites,
  activeId,
  onFocus,
}: {
  campsites: Campsite[];
  activeId: number | null;
  onFocus: (id: number) => void;
}) {
  const centerLat =
    campsites.reduce((s, c) => s + parseFloat(c.latitude), 0) /
    campsites.length;
  const centerLng =
    campsites.reduce((s, c) => s + parseFloat(c.longitude), 0) /
    campsites.length;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={17}
        />
        {campsites.map((c) => {
          const phase = PHASE_CONFIG[c.phase];
          const color = phase?.mapColor ?? "#1f8645";
          const isActive = c.id === activeId;
          return (
            <Marker
              key={c.id}
              position={[parseFloat(c.latitude), parseFloat(c.longitude)]}
              icon={createMarkerIcon(color, isActive)}
              eventHandlers={{ click: () => onFocus(c.id) }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.phase}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
