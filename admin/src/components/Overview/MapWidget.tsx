import { useEffect, useRef } from "react";
import { mapSites } from "@/data/Overview/Data";
import { ShieldAlert, Activity } from "lucide-react";

const PALETTE = {
  bg: "#F4F4F4",
  orange: "#FF6B35",
  yellow: "#F5BB00",
  green: "#0C8345",
  dark: "#0C1618",
};

const hazardArea: [number, number][] = [
  [15.05, 120.19], [15.04, 120.30], [14.98, 120.34],
  [14.95, 120.32], [14.93, 120.25], [14.94, 120.18],
  [14.97, 120.15], [15.02, 120.16],
];

const MapWidget = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [14.98, 120.22],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // ── FIXED: Light Modern Tiles (CartoDB Voyager) ──
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // San Marcelino Highlight (Green subtle area)
      L.polygon(hazardArea, {
        color: PALETTE.green,
        weight: 1.5,
        fillColor: PALETTE.green,
        fillOpacity: 0.1,
        dashArray: "4, 8",
      }).addTo(map);

      mapSites.forEach((site) => {
        const siteColor = site.status === "HQ" ? PALETTE.orange : PALETTE.yellow;

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 rounded-full animate-ping opacity-30" style="background-color: ${siteColor}"></div>
              <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-md" style="background-color: ${siteColor}"></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Popup styled for Light Mode
        const popupContent = `
          <div class="p-3 bg-white rounded-xl shadow-xl border border-black/5 min-w-37.5">
            <div class="text-[9px] font-black uppercase tracking-widest text-black/30 mb-0.5">${site.type}</div>
            <div class="text-[13px] font-black text-[#0C1618] mb-2">${site.name}</div>
            <div class="flex items-center gap-2 pt-2 border-t border-black/5">
              <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${PALETTE.green}"></div>
              <span class="text-[10px] font-bold text-black/60">${site.visitors || 0} ACTIVE NOW</span>
            </div>
          </div>
        `;

        L.marker([site.lat, site.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent, {
            closeButton: false,
            offset: [0, -10],
            className: 'premium-popup-light'
          });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-125 bg-white rounded-[2.5rem] overflow-hidden border border-black/3 shadow-sm group">
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .premium-popup-light .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .premium-popup-light .leaflet-popup-tip { display: none !important; }
        .leaflet-container { background: #f8f9fa !important; }
      `}</style>

      {/* ── Floating Header ── */}
      <div className="absolute top-6 left-6 right-6 z-1000 flex flex-col md:flex-row justify-between items-start gap-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border border-black/5 p-4 rounded-3xl shadow-xl shadow-black/5 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0C8345] rounded-xl">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-[#0C1618] text-xs font-black uppercase tracking-tight">Marcelino Geospatial</h3>
              <p className="text-black/30 text-[9px] font-bold tracking-widest uppercase">Live Surveillance Node</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/90 backdrop-blur-md border border-black/5 p-3 px-5 rounded-full shadow-xl shadow-black/5 flex gap-4 pointer-events-auto">
          {[
            { label: 'HQ', color: PALETTE.orange },
            { label: 'Outpost', color: PALETTE.yellow },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] font-black text-black/40 uppercase tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Indicator (Floating Bottom) ── */}
      <div className="absolute bottom-6 left-6 z-1000 bg-[#FF6B35] px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF6B35]/20">
        <ShieldAlert size={14} className="text-white" />
        <span className="text-white text-[10px] font-black uppercase tracking-widest">Restricted Access</span>
      </div>

      {/* ── Map Container ── */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Subtle overlay to make markers pop */}
      <div className="absolute inset-0 pointer-events-none border-12 border-white/10 rounded-[2.5rem]" />
    </div>
  );
};

export default MapWidget;