import { useSosAlerts } from "@/hooks/useSosAlerts";
import type { SosAlert } from "@/types/sos";
import { Siren, MapPin, Clock, MessageSquare, Activity, CheckCircle2, Loader2 } from "lucide-react";

const WorkflowPanel = () => {
    const { alerts, resolvingId, resolve } = useSosAlerts();

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0C8345] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0C8345]"></span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1618]">
                        System Operational
                    </span>
                </div>
                <span className="text-[10px] font-bold text-[#0C1618]/40 bg-[#F4F4F4] px-2 py-1 rounded-md uppercase">
                    {alerts.length} Active
                </span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-[#0C1618]/5 rounded-4xl">
                        <Activity size={24} className="mx-auto text-[#0C1618]/10 mb-2" />
                        <p className="text-[11px] text-[#0C1618]/30 font-bold uppercase tracking-widest">
                            No Incidents in Queue
                        </p>
                    </div>
                ) : (
                    alerts.map((alert: SosAlert) => {
                        const accentColor = "#FF6B35";

                        return (
                            <div
                                key={alert.id}
                                className="group relative bg-[#F4F4F4]/40 hover:bg-white border border-transparent hover:border-[#0C1618]/5 p-5 rounded-4xl transition-all duration-300 hover:shadow-xl hover:shadow-[#0C1618]/5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                                            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                                        >
                                            <Siren size={18} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-[13px] font-black text-[#0C1618] uppercase tracking-tight">
                                                {alert.trekker.name}
                                            </h3>
                                            <span className="text-[9px] font-mono font-bold text-[#0C1618]/30">
                                                ID: SOS-{String(alert.id).padStart(4, "0")}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border"
                                        style={{
                                            backgroundColor: `${accentColor}10`,
                                            color: accentColor,
                                            borderColor: `${accentColor}20`,
                                        }}
                                    >
                                        {alert.status}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    <div className="flex items-center gap-2 text-[#0C1618]/60">
                                        <MapPin size={12} className="shrink-0" />
                                        <span className="text-[11px] font-bold">
                                            {alert.latitude != null && alert.longitude != null
                                                ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
                                                : "No GPS shared"}
                                        </span>
                                    </div>
                                    {alert.message && (
                                        <div className="flex items-start gap-2 text-[#0C1618]/40 italic bg-white p-3 rounded-2xl shadow-sm border border-[#0C1618]/5">
                                            <MessageSquare size={12} className="mt-0.5 shrink-0" />
                                            <p className="text-[10px] leading-relaxed line-clamp-2 italic">
                                                "{alert.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[#0C1618]/5">
                                    <button
                                        onClick={() => resolve(alert.id)}
                                        disabled={resolvingId === alert.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C8345]/10 text-[#0C8345] text-[9px] font-black uppercase tracking-wider hover:bg-[#0C8345] hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {resolvingId === alert.id ? (
                                            <Loader2 size={11} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={11} />
                                        )}
                                        Mark Resolved
                                    </button>
                                    <div className="flex items-center gap-1.5 text-[#0C1618]/30">
                                        <Clock size={10} strokeWidth={3} />
                                        <span className="text-[10px] font-black uppercase tracking-tighter">
                                            {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default WorkflowPanel;