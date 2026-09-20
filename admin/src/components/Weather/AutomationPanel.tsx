import { WEATHER_DATA } from "@data/weather";
import { ShieldAlert, CloudRain, Waves, CheckCircle2 } from "lucide-react";

type WeatherLevel = "Safe" | "Warning" | "Danger";

// same logic as RiskPanel (kept inline for now)
const computeLevel = (rainfall: number, riverLevel: number): WeatherLevel => {
    if (rainfall >= 60 || riverLevel >= 3.5) return "Danger";
    if (rainfall >= 30 || riverLevel >= 2.8) return "Warning";
    return "Safe";
};

const AutomationPanel = () => {

    // 🔴 Dangerous routes (auto close trekking)
    const dangerousRoutes = WEATHER_DATA.filter(
        (r) => computeLevel(r.rainfall, r.riverLevel) === "Danger"
    );

    // 🌧️ Heavy rainfall trigger
    const heavyRainRoutes = WEATHER_DATA.filter(
        (r) => r.rainfall >= 50
    );

    // 🌊 Flood risk trigger (river level)
    const floodRiskRoutes = WEATHER_DATA.filter(
        (r) => r.riverLevel >= 3.5
    );

    const hasTriggers =
        dangerousRoutes.length ||
        heavyRainRoutes.length ||
        floodRiskRoutes.length;

    return (
        <div className="space-y-4">
            {/* AUTO CLOSE TREKKING */}
            {dangerousRoutes.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#FF6B35]/5 border border-[#FF6B35]/20 flex flex-col gap-3 group transition-all duration-300 hover:bg-[#FF6B35]/10 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <ShieldAlert size={18} className="text-[#FF6B35]" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#FF6B35]">
                                Protocol: Auto-Close
                            </span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-white/50 border border-[#FF6B35]/10 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#FF6B35] animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-[#FF6B35]">Active</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#0C1618] leading-tight">Critical safety breach detected.</p>
                        <p className="text-[11px] text-[#0C1618]/50 font-medium mt-1 uppercase tracking-wider">
                            Affected: {dangerousRoutes.map(r => r.routeName).join(", ")}
                        </p>
                    </div>
                </div>
            )}

            {/* HEAVY RAIN */}
            {heavyRainRoutes.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#F5BB00]/5 border border-[#F5BB00]/20 flex flex-col gap-3 group transition-all duration-300 hover:bg-[#F5BB00]/10 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <CloudRain size={18} className="text-[#F5BB00]" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#F5BB00]">
                                Rainfall Trigger
                            </span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-white/50 border border-[#F5BB00]/10 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#F5BB00]" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-[#F5BB00]">Caution</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#0C1618] leading-tight">Precipitation exceeded safe thresholds.</p>
                        <p className="text-[11px] text-[#0C1618]/50 font-medium mt-1 uppercase tracking-wider">
                            Stations: {heavyRainRoutes.map(r => r.routeName).join(", ")}
                        </p>
                    </div>
                </div>
            )}

            {/* FLOOD RISK */}
            {floodRiskRoutes.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#0C1618]/5 border border-[#0C1618]/10 flex flex-col gap-3 group transition-all duration-300 hover:bg-[#0C1618]/10 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Waves size={18} className="text-[#0C1618]" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#0C1618]">
                                Flood Intelligence
                            </span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-white/50 border border-[#0C1618]/10 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#0C1618]" />
                            <span className="text-[8px] font-black uppercase tracking-tighter text-[#0C1618]">Risk</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#0C1618] leading-tight">River elevation at critical levels.</p>
                        <p className="text-[11px] text-[#0C1618]/50 font-medium mt-1 uppercase tracking-wider">
                            Zones: {floodRiskRoutes.map(r => r.routeName).join(", ")}
                        </p>
                    </div>
                </div>
            )}

            {/* NO TRIGGERS */}
            {!hasTriggers && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-dashed border-[#0C8345]/10 rounded-3xl">
                    <div className="p-4 bg-[#0C8345]/5 rounded-full">
                        <CheckCircle2 size={32} className="text-[#0C8345]" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0C8345]">System Nominal</p>
                        <p className="text-[10px] font-bold text-[#0C1618]/30 mt-1">No active automation rules triggered</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutomationPanel;