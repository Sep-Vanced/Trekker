import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { Users, TriangleAlert, ShieldCheck, MapPin, Activity } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

type AdminActions = {
    uplandRestricted: boolean;
    evacuation: boolean;
};

const trekkers = [
    { id: 1, name: "Group A", position: [14.9839, 120.2945], status: "Active" },
    { id: 2, name: "Group B", position: [14.9746, 120.1573], status: "Idle" },
    { id: 3, name: "Group C", position: [15.02, 120.26], status: "Active" },
];

const PALETTE = {
    bg: "#F4F4F4",
    orange: "#FF6B35",
    yellow: "#F5BB00", // Standard Trekker color
    green: "#0C8345",
    dark: "#0C1618",
};

const isInsideHazard = (lat: number, lng: number) => {
    return lat >= 14.93 && lat <= 15.05 && lng >= 120.15 && lng <= 120.34;
};

const TrekkerLayer = ({ adminActions }: { adminActions: AdminActions }) => {
    return (
        <>
            {trekkers.map((t) => {
                const [lat, lng] = t.position;
                const insideHazard = isInsideHazard(lat, lng);

                // ── DYNAMIC STATUS LOGIC ──
                let displayStatus = t.status;
                let color = PALETTE.green; // Default Active/Safe
                let isCritical = false;

                if (adminActions.evacuation && insideHazard) {
                    displayStatus = "Critical Evacuation";
                    color = PALETTE.orange;
                    isCritical = true;
                } else if (adminActions.uplandRestricted && insideHazard) {
                    displayStatus = "Restricted Zone";
                    color = PALETTE.yellow;
                } else if (t.status === "Idle") {
                    color = PALETTE.dark;
                }
                // ── PREMIUM CUSTOM MAP PIN (SVG BASED) ──
                const trekkerPinIcon = L.divIcon({
                    className: "custom-trekker-icon",
                    html: renderToStaticMarkup(
                        <div className="relative flex items-center justify-center">
                            {/* Radar Ping for Critical Status */}
                            {isCritical && (
                                <div
                                    className="absolute w-12 h-12 rounded-full animate-ping opacity-30"
                                    style={{ backgroundColor: color }}
                                />
                            )}

                            {/* SVG Map Pin - This ensures the exact shape from your screenshot */}
                            <div className="relative drop-shadow-xl transition-all duration-500 hover:scale-110">
                                <svg
                                    width="36"
                                    height="42"
                                    viewBox="0 0 36 42"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {/* The Outer Pin Shape (The White Border/Stroke) */}
                                    <path
                                        d="M18 42C18 42 36 28.6602 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 28.6602 18 42 18 42Z"
                                        fill="white"
                                    />
                                    {/* The Inner Pin Color (The Main Background) */}
                                    <path
                                        d="M18 39C18 39 33 27.8835 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 27.8835 18 39 18 39Z"
                                        fill={color}
                                    />
                                    {/* The Center Dot (White Hole) */}
                                    <circle cx="18" cy="18" r="5" fill="white" />
                                </svg>
                            </div>
                        </div>
                    ),
                    iconSize: [36, 42],
                    iconAnchor: [18, 42], // Eksakto sa dulo ng buntot
                    popupAnchor: [0, -42],
                });

                return (
                    <Marker
                        key={t.id}
                        position={t.position as any}
                        icon={trekkerPinIcon}
                    >
                        <Popup className="premium-map-popup">
                            <div className="p-1 min-w-55 font-sans">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-[#F4F4F4] rounded-2xl text-[#0C1618]">
                                        <Users size={16} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-[#0C1618] uppercase tracking-tight">
                                            {t.name}
                                        </h4>
                                        <div className="flex items-center gap-1 opacity-40">
                                            <MapPin size={10} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Surveillance Node</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Card */}
                                <div className="space-y-2">
                                    <div
                                        className="flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 shadow-sm"
                                        style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Activity size={14} style={{ color: color }} />
                                            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: color }}>
                                                {displayStatus}
                                            </span>
                                        </div>
                                        {t.status === "Active" && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />}
                                    </div>

                                    {/* Hazard Alert Box */}
                                    {insideHazard && (
                                        <div className="flex items-start gap-2 p-3 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-2xl">
                                            <TriangleAlert size={14} className="text-[#FF6B35] shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-[#FF6B35] leading-tight uppercase">
                                                Inside Hazard Zone
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Institutional Footer */}
                                <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
                                    <span className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">TrekAdmin Security</span>
                                    <ShieldCheck size={12} className="text-black/10" />
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
};

export default TrekkerLayer;