import { Mountain, Waves, AlertTriangle } from "lucide-react";
import { TERRAIN_DATA } from "@data/accessControl";

const ICON_MAP = {
    mapanuepe_road: Mountain,
    lahar_routes: AlertTriangle,
    river_crossings: Waves,
};

const COLOR_MAP = {
    Safe: { text: "text-[#0C8345]", bg: "bg-[#0C8345]/5", border: "border-[#0C8345]/10" },
    Warning: { text: "text-[#F5BB00]", bg: "bg-[#F5BB00]/5", border: "border-[#F5BB00]/10" },
    Danger: { text: "text-[#FF6B35]", bg: "bg-[#FF6B35]/5", border: "border-[#FF6B35]/10" },
};

const TerrainStatus = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TERRAIN_DATA.map((item) => {
                const Icon = ICON_MAP[item.id as keyof typeof ICON_MAP];
                const style = COLOR_MAP[item.type];

                return (
                    <div key={item.id} className={`p-6 rounded-3xl border transition-all duration-300 hover:shadow-md ${style.bg} ${style.border}`}>
                        <div className="p-3 bg-white w-fit rounded-xl shadow-sm mb-4">
                            <Icon className={style.text} size={24} />
                        </div>
                        <h4 className={`text-[11px] font-black uppercase tracking-widest ${style.text} mb-1`}>{item.name}</h4>
                        <p className="text-lg font-black text-[#0C1618]">{item.status}</p>
                        <p className="text-[11px] font-bold text-[#0C1618]/40 mt-2">{item.description}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default TerrainStatus;
