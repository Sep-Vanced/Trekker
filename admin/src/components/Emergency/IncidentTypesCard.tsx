import { useSosAlerts } from "@/hooks/useSosAlerts";
import type { SosAlert } from "@/types/sos";
import { Siren, Clock, AlertOctagon, CheckCircle } from "lucide-react";

const getMinutesElapsed = (dateStr: string) =>
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);

const IncidentTypesCard = () => {
    const { alerts } = useSosAlerts();
    const total = alerts.length;

    const buckets = [
        {
            label: "Just Triggered",
            sub: "< 5 min",
            value: alerts.filter((a: SosAlert) => getMinutesElapsed(a.created_at) < 5).length,
            icon: Siren,
            color: "text-[#F5BB00]",
            bg: "bg-[#F5BB00]/10",
            accent: "bg-[#F5BB00]",
        },
        {
            label: "Awaiting Response",
            sub: "5–15 min",
            value: alerts.filter((a: SosAlert) => {
                const m = getMinutesElapsed(a.created_at);
                return m >= 5 && m < 15;
            }).length,
            icon: Clock,
            color: "text-[#FF6B35]",
            bg: "bg-[#FF6B35]/10",
            accent: "bg-[#FF6B35]",
        },
        {
            label: "Overdue",
            sub: "15–30 min",
            value: alerts.filter((a: SosAlert) => {
                const m = getMinutesElapsed(a.created_at);
                return m >= 15 && m < 30;
            }).length,
            icon: AlertOctagon,
            color: "text-[#a3291f]",
            bg: "bg-[#a3291f]/10",
            accent: "bg-[#a3291f]",
        },
        {
            label: "Critical",
            sub: "> 30 min",
            value: alerts.filter((a: SosAlert) => getMinutesElapsed(a.created_at) >= 30).length,
            icon: CheckCircle,
            color: "text-[#0C1618]",
            bg: "bg-[#0C1618]/5",
            accent: "bg-[#0C1618]",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 p-1">
            {buckets.map((b) => {
                const percentage = total > 0 ? (b.value / total) * 100 : 0;
                return (
                    <div
                        key={b.label}
                        className="group relative bg-white rounded-2xl p-4 border border-[#0C1618]/5 transition-all duration-300 hover:shadow-sm overflow-hidden"
                    >
                        <div className={`absolute top-0 right-4 h-1 w-8 rounded-b-full ${b.accent} opacity-30`} />
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className={`p-2 rounded-xl border border-black/5 ${b.bg} ${b.color}`}>
                                    <b.icon size={16} strokeWidth={2.5} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-[#0C1618]/80 uppercase tracking-tight">
                                    {b.label}
                                </h3>
                                <p className="text-[9px] font-bold text-[#0C1618]/30 uppercase">{b.sub}</p>
                            </div>
                            <div className="flex items-end justify-between border-t border-[#0C1618]/5 pt-3">
                                <span className="text-2xl font-black text-[#0C1618] leading-none tracking-tighter">
                                    {b.value.toString().padStart(2, "0")}
                                </span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] font-black text-[#0C1618]/40 italic">
                                        {percentage.toFixed(0)}%
                                    </span>
                                    <div className="w-10 h-1 bg-[#F4F4F4] rounded-full overflow-hidden">
                                        <div className={`h-full ${b.accent}`} style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default IncidentTypesCard;