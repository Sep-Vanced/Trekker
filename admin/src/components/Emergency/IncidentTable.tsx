import { useSosAlerts } from "@/hooks/useSosAlerts";
import type { SosAlert } from "@/types/sos";
import {
    MapPin,
    Clock,
    ShieldAlert,
    Hash,
    CircleDot,
    CheckCircle2,
    Loader2,
} from "lucide-react";

const getElapsedTime = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
};

const IncidentTable = () => {
    const { alerts, resolvingId, resolve } = useSosAlerts();

    return (
        <div className="w-full">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-[#0C1618]/30">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-2">
                                <Hash size={12} strokeWidth={3} />
                                SOS Details
                            </div>
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-2">
                                <MapPin size={12} strokeWidth={3} />
                                Location
                            </div>
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                            <div className="flex items-center justify-center gap-2">
                                <ShieldAlert size={12} strokeWidth={3} />
                                Status
                            </div>
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Clock size={12} strokeWidth={3} />
                                Timeline
                            </div>
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-right">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {alerts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-[#0C1618]/30 text-xs font-bold uppercase tracking-widest">
                                No active SOS alerts
                            </td>
                        </tr>
                    ) : (
                        alerts.map((alert: SosAlert) => (
                            <tr
                                key={alert.id}
                                className="group bg-[#F4F4F4]/30 hover:bg-white hover:shadow-md transition-all duration-300 rounded-2xl"
                            >
                                <td className="px-4 py-5 first:rounded-l-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-[#FF6B35] text-white animate-pulse">
                                            <CircleDot size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-extrabold text-[#0C1618] tracking-tight group-hover:text-[#0C8345] transition-colors">
                                                {alert.trekker.name}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-[#0C1618]/30">
                                                REF-{String(alert.id).padStart(5, "0")}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-[#0C1618]/80">
                                            {alert.latitude != null && alert.longitude != null
                                                ? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`
                                                : "No GPS shared"}
                                        </span>
                                        {alert.message && (
                                            <span className="text-[11px] text-[#0C1618]/50 italic line-clamp-1 max-w-45">
                                                "{alert.message}"
                                            </span>
                                        )}
                                    </div>
                                </td>

                                <td className="px-4 py-5">
                                    <div className="flex justify-center">
                                        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20">
                                            {alert.status}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-5">
                                    <div className="flex items-center justify-end gap-4">
                                        <div className="text-right">
                                            <div className="text-xs font-black text-[#FF6B35]">
                                                {getElapsedTime(alert.created_at)}
                                            </div>
                                            <div className="text-[9px] font-bold text-[#0C1618]/20 uppercase">
                                                {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-5 last:rounded-r-2xl">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => resolve(alert.id)}
                                            disabled={resolvingId === alert.id}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0C8345]/10 text-[#0C8345] text-[10px] font-black uppercase tracking-wider hover:bg-[#0C8345] hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            {resolvingId === alert.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={12} />
                                            )}
                                            Resolve
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default IncidentTable;