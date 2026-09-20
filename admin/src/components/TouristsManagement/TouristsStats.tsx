import type { Tourist } from "@/types/tourist";
import { CheckCircle2, AlertTriangle, Activity, Clock, WifiOff } from "lucide-react";

const TouristsStats = ({ tourists }: { tourists: Tourist[] }) => {
    const MAX_TREK_HOURS = 6;

    const isOverdue = (t: Tourist) =>
        t.status === "Active" &&
        (Date.now() - new Date(t.startTime).getTime()) / 36e5 > MAX_TREK_HOURS;

    const isSignalLost = (t: Tourist) =>
        t.status === "Active" &&
        (Date.now() - new Date(t.lastPing).getTime()) / 60000 > 15;

    const active = tourists.filter((t) => t.status === "Active").length;
    const completed = tourists.filter((t) => t.status === "Completed").length;
    const emergency = tourists.filter((t) => t.status === "Emergency").length;
    const overdue = tourists.filter(isOverdue).length;
    const noSignal = tourists.filter(isSignalLost).length;
    const total = tourists.length;

    const statCards = [
        {
            label: "Active Trekking",
            value: active,
            icon: Activity,
            color: "text-[#FF6B35]",
            glow: "shadow-[#FF6B35]/10",
            bg: "bg-[#FF6B35]/5",
            description: "Live on trails",
        },
        {
            label: "Overdue",
            value: overdue,
            icon: Clock,
            color: "text-[#F5BB00]",
            glow: "shadow-[#F5BB00]/10",
            bg: "bg-[#F5BB00]/5",
            description: "Beyond 6h limit",
        },
        {
            label: "Signal Lost",
            value: noSignal,
            icon: WifiOff,
            color: "text-[#0C1618]",
            glow: "shadow-[#0C1618]/5",
            bg: "bg-[#0C1618]/5",
            description: "Offline > 15m",
        },
        {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-[#0C8345]",
            glow: "shadow-[#0C8345]/10",
            bg: "bg-[#0C8345]/5",
            description: "Safely returned",
        },
        {
            label: "Emergency",
            value: emergency,
            icon: AlertTriangle,
            color: "text-[#FF6B35]",
            glow: "shadow-[#FF6B35]/20",
            bg: "bg-[#FF6B35]/10",
            description: "Immediate help",
        },
    ];

    return (
        <div className="w-full ">

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`group relative p-6 bg-white rounded-3xl border border-[#F4F4F4] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${stat.glow}`}
                    >
                        <div className="flex flex-col h-full justify-between gap-4">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-2xl ${stat.bg} transition-colors group-hover:bg-opacity-80`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                {stat.value > 0 && (
                                    <span className={`flex h-2 w-2 rounded-full ${stat.label === 'Emergency' ? 'bg-[#FF6B35] animate-ping' : 'bg-transparent'}`} />
                                )}
                            </div>

                            <div>
                                <p className="text-[#0C1618]/60 text-xs font-bold uppercase tracking-widest mb-1">
                                    {stat.label}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-4xl font-black text-[#0C1618] tracking-tighter">
                                        {stat.value}
                                    </h3>
                                    <span className="text-[#0C1618]/30 text-sm font-medium">/ {total}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#F4F4F4]">
                                <p className="text-[#0C1618]/40 text-[11px] font-medium leading-tight">
                                    {stat.description}
                                </p>
                            </div>
                        </div>

                        {/* Premium Hover Accent */}
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 transition-all duration-300 group-hover:w-1/2 rounded-t-full ${stat.color.replace('text', 'bg')}`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TouristsStats;