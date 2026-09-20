import { Polygon, Popup } from "react-leaflet";
import { ShieldCheck, Map as MapIcon } from "lucide-react";

// 🗺️ Approximate boundary of San Marcelino
const sanMarcelinoBoundary: [number, number][] = [
    [15.05, 120.19],
    [15.04, 120.30],
    [14.98, 120.34],
    [14.95, 120.32],
    [14.93, 120.25],
    [14.94, 120.18],
    [14.97, 120.15],
    [15.02, 120.16],
];

const PALETTE = {
    green: "#0C8345",
    dark: "#0C1618",
    white: "#F4F4F4"
};

const SanMarcelinoBoundary = () => {
    return (
        <Polygon
            positions={sanMarcelinoBoundary}
            pathOptions={{
                // Premium "Radar" Aesthetic
                color: PALETTE.green,
                weight: 3,
                dashArray: "1, 10", // Optional: Creates a technical "dotted" border
                lineCap: "round",
                fillColor: PALETTE.green,
                fillOpacity: 0.05, // Very subtle to keep the map clean
            }}
            eventHandlers={{
                mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        fillOpacity: 0.15,
                        weight: 4,
                    });
                },
                mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        fillOpacity: 0.05,
                        weight: 3,
                    });
                },
            }}
        >
            <Popup closeButton={false} className="boundary-popup">
                <div className="p-3 min-w-48 bg-[#F4F4F4] rounded-2xl font-sans">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0C8345]/10 rounded-xl text-[#0C8345]">
                            <ShieldCheck size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-[12px] font-black text-[#0C1618] uppercase tracking-wider leading-none">
                                Active Zone
                            </h4>
                            <p className="text-[10px] font-bold text-[#0C1618]/40 uppercase tracking-widest mt-1">
                                San Marcelino
                            </p>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#0C1618]/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <MapIcon size={12} className="text-[#0C1618]" />
                            <span className="text-[9px] font-bold text-[#0C1618]">Zambales, PH</span>
                        </div>
                        <span className="text-[8px] font-black text-[#0C8345] uppercase tracking-tighter">
                            Monitored
                        </span>
                    </div>
                </div>
            </Popup>
        </Polygon>
    );
};

export default SanMarcelinoBoundary;