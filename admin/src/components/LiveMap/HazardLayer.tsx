import { Polygon, Popup } from "react-leaflet";
import { ShieldAlert, Ban, Siren, Activity, MapPin } from "lucide-react";

type AdminActions = {
    uplandRestricted: boolean;
    evacuation: boolean;
};

const PALETTE = {
    bg: "#F4F4F4",
    orange: "#FF6B35",
    yellow: "#F5BB00",
    green: "#0C8345", // Ito ang magiging main color ng polygon
    dark: "#0C1618",
};

const hazardArea: [number, number][] = [
    [15.05, 120.19], [15.04, 120.30], [14.98, 120.34],
    [14.95, 120.32], [14.93, 120.25], [14.94, 120.18],
    [14.97, 120.15], [15.02, 120.16],
];

const HazardLayer = ({ adminActions }: { adminActions: AdminActions }) => {
    const isRestricted = adminActions.uplandRestricted;
    const isEvacuation = adminActions.evacuation;

    // Visual logic following the MapWidget style
    const baseColor = PALETTE.green;
    const alertColor = isEvacuation ? PALETTE.orange : isRestricted ? PALETTE.yellow : baseColor;

    return (
        <Polygon
            positions={hazardArea}
            pathOptions={{
                color: alertColor,
                weight: isRestricted ? 2.5 : 1.5,
                dashArray: "4, 8",
                fillColor: baseColor,
                fillOpacity: isEvacuation ? 0.3 : isRestricted ? 0.2 : 0.1,
            }}
        >
            <Popup className="premium-map-popup">
                <div className="p-1 min-w-55 font-['Plus_Jakarta_Sans',sans-serif]">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            className="p-2 rounded-xl transition-colors duration-300"
                            style={{ backgroundColor: `${alertColor}15`, color: alertColor }}
                        >
                            <ShieldAlert size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-[13px] font-black text-[#0C1618] leading-none tracking-tight">
                                Hazard Zone
                            </h4>
                            <div className="flex items-center gap-1 mt-1 opacity-40">
                                <MapPin size={10} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">San Marcelino</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Content */}
                    <div className="space-y-2">
                        {isEvacuation ? (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                                <Siren size={14} className="text-[#FF6B35] animate-pulse" />
                                <p className="text-[11px] font-black text-[#FF6B35] uppercase tracking-tighter">
                                    Evacuation Active
                                </p>
                            </div>
                        ) : isRestricted ? (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5BB00]/10 border border-[#F5BB00]/20">
                                <Ban size={14} className="text-[#F5BB00]" />
                                <p className="text-[11px] font-black text-[#F5BB00] uppercase tracking-tighter">
                                    Access Restricted
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0C8345]/5 border border-[#0C8345]/10">
                                <Activity size={14} className="text-[#0C8345]" />
                                <p className="text-[11px] font-bold text-[#0C8345] uppercase tracking-tighter">
                                    Monitoring Active
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-2 border-t border-black/5 flex justify-between items-center">
                        <span className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">Verified System</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0C8345]" />
                    </div>
                </div>
            </Popup>
        </Polygon>
    );
};

export default HazardLayer;