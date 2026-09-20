import { MessageSquareWarning } from "lucide-react";

const SystemControl = () => {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/40">Active Terrain Override</label>
                <div className="flex flex-col gap-2">
                    {["Dry", "Muddy", "Flooded"].map((mode) => (
                        <button
                            key={mode}
                            className={`w-full py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'Dry'
                                    ? 'bg-[#0C1618] text-white border-transparent shadow-lg'
                                    : 'bg-white text-[#0C1618]/60 border-black/5 hover:border-black/20 hover:bg-white'
                                }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-black/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageSquareWarning size={18} className="text-[#F5BB00]" />
                        <span className="text-xs font-bold text-[#0C1618]">Auto-Warning</span>
                    </div>
                    <div className="w-10 h-5 bg-[#0C8345] rounded-full relative shadow-inner cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                </div>
                <p className="text-[10px] font-medium text-[#0C1618]/40 leading-relaxed italic">
                    Enabled: Sends an automated SMS warning to all tourists within 2km of the entry point during muddy or flooded conditions.
                </p>
            </div>
        </div>
    );
};

export default SystemControl;
