import { WEATHER_DATA } from "@data/weather";
import {
    CloudRain,
    Waves,
    Wind,
    Cloud,
    Sun,
    CloudLightning,
    MapPin,
    Circle
} from "lucide-react";

/* ───────────────── TYPES ───────────────── */
type WeatherLevel = "Safe" | "Warning" | "Danger";

/* ───────────────── LOGIC ───────────────── */
const computeLevel = (rainfall: number, riverLevel: number): WeatherLevel => {
    if (rainfall >= 60 || riverLevel >= 3.5) return "Danger";
    if (rainfall >= 30 || riverLevel >= 2.8) return "Warning";
    return "Safe";
};

const getLevelStyles = (level: WeatherLevel) => {
    switch (level) {
        case "Danger":
            return {
                bg: "bg-[#FF6B35]/5",
                dot: "bg-[#FF6B35]",
                text: "text-[#FF6B35]",
                label: "High Risk",
            };
        case "Warning":
            return {
                bg: "bg-[#F5BB00]/5",
                dot: "bg-[#F5BB00]",
                text: "text-[#F5BB00]",
                label: "Warning",
            };
        default:
            return {
                bg: "bg-[#0C8345]/5",
                dot: "bg-[#0C8345]",
                text: "text-[#0C8345]",
                label: "Optimal",
            };
    }
};

const getConditionIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('storm') || c.includes('lightning')) return <CloudLightning size={16} strokeWidth={2.5} className="text-[#0C1618]/40" />;
    if (c.includes('rain')) return <CloudRain size={16} strokeWidth={2.5} className="text-[#0C1618]/40" />;
    if (c.includes('cloud')) return <Cloud size={16} strokeWidth={2.5} className="text-[#0C1618]/40" />;
    return <Sun size={16} strokeWidth={2.5} className="text-[#0C1618]/40" />;
};

/* ───────────────── COMPONENT ───────────────── */
const WeatherTable = () => {
    return (
        <div className="w-full overflow-hidden">
            <table className="w-full border-collapse">
                {/* ── HEAD ── */}
                <thead>
                    <tr className="border-b border-gray-50">
                        <th className="pl-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/30">Route Analysis</th>
                        <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/30">Rainfall</th>
                        <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/30">River</th>
                        <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/30">Wind</th>
                        <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/30">Condition</th>
                        <th className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/30">Status</th>
                    </tr>
                </thead>

                {/* ── BODY ── */}
                <tbody className="divide-y divide-gray-50">
                    {WEATHER_DATA.map((item) => {
                        const level = computeLevel(item.rainfall, item.riverLevel);
                        const styles = getLevelStyles(level);

                        return (
                            <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                                {/* Route */}
                                <td className="pl-6 py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-gray-50 rounded-2xl group-hover:bg-white transition-all duration-300 border border-transparent group-hover:border-black/5">
                                            <MapPin size={16} strokeWidth={2.5} className="text-[#0C1618]/40" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-[#0C1618] tracking-tight">{item.routeName}</span>
                                            <span className="text-[9px] font-bold text-[#0C1618]/20 uppercase tracking-widest">Zone {item.id}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Rainfall */}
                                <td className="px-4 py-5">
                                    <div className="flex items-center gap-2">
                                        <CloudRain size={16} strokeWidth={2.5} className="text-[#0C1618]/10" />
                                        <span className="text-sm font-black text-[#0C1618] tabular-nums tracking-tighter">{item.rainfall}<span className="text-[10px] font-bold text-[#0C1618]/20 ml-1 uppercase">mm</span></span>
                                    </div>
                                </td>

                                {/* River */}
                                <td className="px-4 py-5">
                                    <div className="flex items-center gap-2">
                                        <Waves size={16} strokeWidth={2.5} className="text-[#0C1618]/10" />
                                        <span className="text-sm font-black text-[#0C1618] tabular-nums tracking-tighter">{item.riverLevel}<span className="text-[10px] font-bold text-[#0C1618]/20 ml-1 uppercase">m</span></span>
                                    </div>
                                </td>

                                {/* Wind */}
                                <td className="px-4 py-5">
                                    <div className="flex items-center gap-2">
                                        <Wind size={16} strokeWidth={2.5} className="text-[#0C1618]/10" />
                                        <span className="text-sm font-black text-[#0C1618] tabular-nums tracking-tighter">{item.windSpeed}<span className="text-[10px] font-bold text-[#0C1618]/20 ml-1 uppercase">km/h</span></span>
                                    </div>
                                </td>

                                {/* Condition */}
                                <td className="px-4 py-5">
                                    <div className="flex items-center gap-3">
                                        {getConditionIcon(item.condition)}
                                        <span className="text-xs font-bold text-[#0C1618]/60 uppercase tracking-widest">{item.condition}</span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="pr-8 py-5 text-right">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/5 ${styles.bg}`}>
                                        <Circle size={6} fill="currentColor" className={`${styles.text} ${level === 'Danger' ? 'animate-pulse' : ''}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                                            {styles.label}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default WeatherTable;