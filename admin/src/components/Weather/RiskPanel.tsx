import { WEATHER_DATA } from "@data/weather";
import { ShieldCheck, TriangleAlert, AlertCircle } from "lucide-react";

type WeatherLevel = "Safe" | "Warning" | "Danger";

const LEVEL_STYLE = {
    Safe: {
        bg: "bg-[#0C8345]/5",
        text: "text-[#0C8345]",
        border: "border-[#0C8345]/20",
        icon: ShieldCheck,
        label: "Optimal",
        desc: "Normal conditions",
    },
    Warning: {
        bg: "bg-[#F5BB00]/5",
        text: "text-[#F5BB00]",
        border: "border-[#F5BB00]/20",
        icon: TriangleAlert,
        label: "Warning",
        desc: "Monitor closely",
    },
    Danger: {
        bg: "bg-[#FF6B35]/5",
        text: "text-[#FF6B35]",
        border: "border-[#FF6B35]/20",
        icon: AlertCircle,
        label: "High Risk",
        desc: "Closure active",
    },
};

// 👉 Inline risk computation (no external function)
const computeLevel = (rainfall: number, riverLevel: number): WeatherLevel => {
    if (rainfall >= 60 || riverLevel >= 3.5) return "Danger";
    if (rainfall >= 30 || riverLevel >= 2.8) return "Warning";
    return "Safe";
};

const RiskPanel = () => {

    // 👉 Determine highest risk across all routes
    const highestRisk = WEATHER_DATA.reduce<WeatherLevel>((acc, curr) => {
        const level = computeLevel(curr.rainfall, curr.riverLevel);

        const priority = { Safe: 0, Warning: 1, Danger: 2 };

        return priority[level] > priority[acc] ? level : acc;
    }, "Safe");

    // 👉 Optional: get which route triggered it
    const dangerRoute = WEATHER_DATA.find(
        (r) => computeLevel(r.rainfall, r.riverLevel) === highestRisk
    );

    return (
        <div className="space-y-4">

            {Object.entries(LEVEL_STYLE).map(([level, style]) => {
                const isActive = level === highestRisk;
                const Icon = style.icon;

                return (
                    <div
                        key={level}
                        className={`
                            flex flex-col p-5 rounded-2xl border transition-all duration-500
                            ${isActive
                                ? `${style.bg} ${style.border} shadow-sm scale-[1.02]`
                                : "bg-white border-gray-100 opacity-40 grayscale"
                            }
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                                    <Icon size={18} className={style.text} strokeWidth={2.5} />
                                </div>
                                <span className={`font-black text-[11px] uppercase tracking-[0.15em] ${style.text}`}>
                                    {style.label}
                                </span>
                            </div>

                            {isActive && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/50 border border-black/5">
                                    <span className={`w-1 h-1 rounded-full ${level === 'Danger' ? 'animate-pulse' : ''} ${style.text.replace('text', 'bg')}`} />
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-[#0C1618]/40">Live</span>
                                </div>
                            )}
                        </div>

                        <span className="text-[11px] font-semibold text-[#0C1618]/60 mt-3 leading-tight">
                            {style.desc}
                        </span>

                        {isActive && dangerRoute && (
                            <div className="mt-4 pt-3 border-t border-black/5">
                                <p className="text-[9px] font-bold text-[#0C1618]/30 uppercase tracking-widest mb-0.5">Primary Source</p>
                                <p className="text-[10px] font-black text-[#0C1618]/80">{dangerRoute.routeName} Station</p>
                            </div>
                        )}
                    </div>
                );
            })}

        </div>
    );
};

export default RiskPanel;