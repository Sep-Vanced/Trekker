import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WEATHER_DATA } from "@data/weather";
import { CloudRain, Thermometer, AlertTriangle, Waves, MapPin, Clock } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

/* ───────────────── TYPES ───────────────── */
type WeatherLevel = "Safe" | "Warning" | "Danger";

/* ───────────────── CONSTANTS ───────────────── */
const PALETTE = {
    bg: "#F4F4F4",
    orange: "#FF6B35", // Danger
    yellow: "#F5BB00", // Warning
    green: "#0C8345",  // Safe
    dark: "#0C1618",
};

const PRIORITY: Record<WeatherLevel, number> = {
    Safe: 0,
    Warning: 1,
    Danger: 2,
};

const SAN_MARCELINO_POLYGON: [number, number][] = [
    [15.05, 120.19], [15.04, 120.30], [14.98, 120.34],
    [14.95, 120.32], [14.93, 120.25], [14.94, 120.18],
    [14.97, 120.15], [15.02, 120.16],
];

/* ───────────────── LOGIC ───────────────── */
const computeLevel = (rainfall: number, riverLevel: number): WeatherLevel => {
    if (rainfall >= 60 || riverLevel >= 3.5) return "Danger";
    if (rainfall >= 30 || riverLevel >= 2.8) return "Warning";
    return "Safe";
};

const getLevelColor = (level: WeatherLevel) => {
    if (level === "Danger") return PALETTE.orange;
    if (level === "Warning") return PALETTE.yellow;
    return PALETTE.green;
};

const getHighestRisk = (): WeatherLevel => {
    return WEATHER_DATA.reduce<WeatherLevel>((acc, curr) => {
        const level = computeLevel(curr.rainfall, curr.riverLevel);
        return PRIORITY[level] > PRIORITY[acc] ? level : acc;
    }, "Safe");
};

/* ───────────────── COMPONENT ───────────────── */
const WeatherMap = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);

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

            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                maxZoom: 19
            }).addTo(map);

            /* ── DYNAMIC PIN CREATOR ── */
            const createWeatherIcon = (level: WeatherLevel) => {
                const color = getLevelColor(level);
                const isUrgent = level === "Danger";

                // Icon changes based on severity
                const StatusIcon = level === "Danger" ? AlertTriangle : level === "Warning" ? CloudRain : Thermometer;

                const iconMarkup = renderToStaticMarkup(
                    <div className="relative flex items-center justify-center">
                        {isUrgent && (
                            <div className="absolute w-12 h-12 rounded-full animate-pulse opacity-20" style={{ backgroundColor: color }} />
                        )}
                        <div className="relative drop-shadow-xl transition-all duration-500 hover:scale-110">
                            <svg width="36" height="42" viewBox="0 0 36 42" fill="none">
                                <path d="M18 42C18 42 36 28.6602 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 28.6602 18 42 18 42Z" fill="white" />
                                <path d="M18 39C18 39 33 27.8835 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 27.8835 18 39 18 39Z" fill={color} />
                                <foreignObject x="10" y="10" width="16" height="16">
                                    <div className="flex items-center justify-center w-full h-full text-white">
                                        <StatusIcon size={14} strokeWidth={3} />
                                    </div>
                                </foreignObject>
                            </svg>
                        </div>
                    </div>
                );

                return L.divIcon({
                    html: iconMarkup,
                    className: "weather-marker",
                    iconSize: [36, 42],
                    iconAnchor: [18, 42],
                    popupAnchor: [0, -42],
                });
            };

            /* ── POLYGON ── */
            const highestRisk = getHighestRisk();
            const polygonColor = getLevelColor(highestRisk);

            L.polygon(SAN_MARCELINO_POLYGON, {
                color: polygonColor,
                weight: 2,
                fillColor: polygonColor,
                fillOpacity: 0.1,
                dashArray: "5, 10",
            }).addTo(map);

            /* ── MARKERS ── */
            WEATHER_DATA.forEach((route) => {
                if (!("lat" in route) || !("lng" in route)) return;

                const level = computeLevel(route.rainfall, route.riverLevel);
                const color = getLevelColor(level);

                const popupContent = renderToStaticMarkup(
                    <div className="p-1 min-w-64 font-sans bg-[#F4F4F4] rounded-3xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0C1618]/5 bg-white/50">
                            <div className="p-2.5 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: `${color}15` }}>
                                <CloudRain size={18} style={{ color: color }} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-[12px] font-black text-[#0C1618] leading-none tracking-wider uppercase">Station Analysis</h4>
                                <span className="text-[9px] font-bold text-[#0C1618]/40 tracking-widest uppercase mt-1">Zone {route.routeName}</span>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded-2xl border border-black/5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Rainfall</p>
                                    <p className="text-sm font-black text-[#0C1618]">{route.rainfall} mm</p>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-black/5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">River Level</p>
                                    <p className="text-sm font-black text-[#0C1618]">{route.riverLevel} m</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 pt-3 border-t border-[#0C1618]/5">
                                <div className="flex items-center gap-2.5 text-[#0C1618]/70 text-[11px] font-medium">
                                    <div className="p-1 bg-white rounded-md shadow-sm border border-black/5"><MapPin size={12} className="text-[#FF6B35]" /></div>
                                    <span>{route.routeName} Station</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#0C1618]/50 text-[10px] font-semibold">
                                    <div className="p-1 bg-white rounded-md shadow-sm border border-black/5"><Clock size={12} /></div>
                                    <span>Real-time Monitoring</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ backgroundColor: `${color}15`, color: color }}>
                                    {level} Status
                                </div>
                            </div>
                        </div>
                    </div>
                );

                L.marker([route.lat, route.lng], { icon: createWeatherIcon(level) })
                    .addTo(map)
                    .bindPopup(popupContent, {
                        closeButton: false,
                        className: "premium-weather-popup",
                    });
            });
        });

        return () => {
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div className="relative w-full h-full min-h-150 bg-white rounded-[2.5rem] overflow-hidden border border-black/5 shadow-sm">
            <style>{`
                .premium-weather-popup .leaflet-popup-content-wrapper {
                    background: #F4F4F4 !important;
                    color: #0C1618 !important;
                    border-radius: 1.5rem !important;
                    padding: 0 !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid rgba(12, 22, 24, 0.05);
                }
                .premium-weather-popup .leaflet-popup-content {
                    margin: 0 !important;
                    width: 280px !important;
                }
                .premium-weather-popup .leaflet-popup-tip {
                    background: #F4F4F4 !important;
                }
            `}</style>

            {/* Premium Overlay Header */}
            <div className="absolute top-8 left-8 z-1000 bg-white/20 backdrop-blur-xl border border-white/20 p-5 rounded-4xl shadow-2xl flex items-center gap-4">
                <div className="p-3 bg-[#0C8345] rounded-2xl shadow-lg shadow-[#0C8345]/20">
                    <Waves size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-black tracking-tight text-[#0C1618]">Environmental Map</h3>
                    <p className="text-[10px] text-black/40 uppercase font-bold tracking-[0.2em]">Live Telemetry</p>
                </div>
            </div>

            {/* Minimalist Legend */}
            <div className="absolute top-8 right-8 z-1000 bg-white/20 backdrop-blur-xl border border-white/20 p-4 px-6 rounded-full shadow-2xl flex gap-6">
                {(["Safe", "Warning", "Danger"] as WeatherLevel[]).map((level) => (
                    <div key={level} className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${level === 'Danger' ? 'animate-pulse' : ''}`} style={{ backgroundColor: getLevelColor(level) }} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{level}</span>
                    </div>
                ))}
            </div>

            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
};

export default WeatherMap;