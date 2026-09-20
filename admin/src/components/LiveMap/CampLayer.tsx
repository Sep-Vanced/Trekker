import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { Tent, Ban, CheckCircle2, MapPin, Clock } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

type AdminActions = {
    lakeClosed: boolean;
};

const PALETTE = {
    bg: "#F4F4F4",
    orange: "#FF6B35",
    yellow: "#F5BB00", // Campsite Primary
    green: "#0C8345",
    dark: "#0C1618",
};

const CampLayer = ({ adminActions }: { adminActions: AdminActions }) => {
    const isClosed = adminActions.lakeClosed;
    const statusColor = isClosed ? PALETTE.orange : PALETTE.green;

    // ── PREMIUM CAMPSITE ICON (SVG BASED) ──
    const campIcon = L.divIcon({
        className: "custom-camp-marker",
        html: renderToStaticMarkup(
            <div className="relative flex items-center justify-center">
                {/* Radar Pulse for Active Sites */}
                {!isClosed && (
                    <div
                        className="absolute w-12 h-12 rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: PALETTE.yellow }}
                    />
                )}

                {/* SVG Camp Pin - Consistent with Trekker style but using a Tent motif */}
                <div className={`relative drop-shadow-xl transition-all duration-500 hover:scale-110 ${isClosed ? 'grayscale opacity-80' : ''}`}>
                    <svg
                        width="36"
                        height="42"
                        viewBox="0 0 36 42"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Outer Pin Body */}
                        <path
                            d="M18 42C18 42 36 28.6602 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 28.6602 18 42 18 42Z"
                            fill="white"
                        />
                        {/* Inner Pin Body */}
                        <path
                            d="M18 39C18 39 33 27.8835 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 27.8835 18 39 18 39Z"
                            fill={PALETTE.yellow}
                        />
                        {/* Center Tent Icon (White) */}
                        <g transform="translate(10, 10)">
                            <path
                                d="M8 2L1 14H15L8 2Z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8 2V14"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    </svg>
                </div>
            </div>
        ),
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42],
    });

    return (
        <Marker
            position={[14.9839 + 0.0008, 120.2945 + 0.0008]}
            icon={campIcon}
            zIndexOffset={1000}
        >
            <Popup className="premium-map-popup">
                <div className="p-1 min-w-60 font-sans">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="p-2.5 rounded-2xl shadow-sm border border-black/5"
                            style={{ backgroundColor: `${PALETTE.yellow}15`, color: PALETTE.yellow }}
                        >
                            <Tent size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-black text-[#0C1618] leading-none tracking-tight">
                                Mapanuepe Campsite
                            </h4>
                            <div className="flex items-center gap-1 mt-1 opacity-40">
                                <MapPin size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Aglao, Zambales</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="space-y-3">
                        <div
                            className="flex items-center justify-between p-3 rounded-2xl border transition-all duration-300"
                            style={{
                                backgroundColor: `${statusColor}08`,
                                borderColor: `${statusColor}20`
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {isClosed ? (
                                    <Ban size={14} style={{ color: PALETTE.orange }} />
                                ) : (
                                    <CheckCircle2 size={14} style={{ color: PALETTE.green }} />
                                )}
                                <span
                                    className="text-[10px] font-black uppercase tracking-wider"
                                    style={{ color: statusColor }}
                                >
                                    {isClosed ? "Access Denied" : "Operational"}
                                </span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
                        </div>

                        {/* Notice Logic */}
                        {isClosed ? (
                            <p className="px-1 text-[11px] font-medium text-[#0C1618]/60 leading-relaxed">
                                Site is currently <span className="text-[#0C1618] font-bold">Closed</span> due to administrative advisory for safety monitoring.
                            </p>
                        ) : (
                            <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-[#0C1618]/40 uppercase tracking-tight">
                                <Clock size={12} />
                                <span>Facility Status: Optimal</span>
                            </div>
                        )}
                    </div>

                    {/* Institutional Footer */}
                    <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center">
                        <span className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">Verified Facility</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-black/10" />
                            <div className="w-1 h-1 rounded-full bg-black/10" />
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export default CampLayer;