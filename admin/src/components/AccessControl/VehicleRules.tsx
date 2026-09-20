import { CheckCircle2, XCircle } from "lucide-react";
import { VEHICLE_MATRIX } from "@data/accessControl";

const VehicleRules = () => {
    return (
        <div className="space-y-4">
            {VEHICLE_MATRIX.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-5 rounded-2xl border border-black/5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-10 rounded-full" style={{ backgroundColor: rule.color }} />
                        <div>
                            <p className="text-sm font-black text-[#0C1618]">{rule.type}</p>
                            <p className="text-[10px] font-bold text-[#0C1618]/30 uppercase tracking-widest">{rule.logic}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status:</span>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/5 shadow-sm">
                            {rule.status === "Allowed" ? (
                                <CheckCircle2 size={14} className="text-[#0C8345]" />
                            ) : (
                                <XCircle size={14} className="text-[#FF6B35]" />
                            )}
                            <span className="text-[11px] font-black text-[#0C1618]">{rule.status}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VehicleRules;
