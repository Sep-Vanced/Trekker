import type { Tourist } from "@/types/tourist";
import {
    User,
    Car,
    MapPin,
    Clock,
    Navigation2,
    ShieldCheck,
    AlertTriangle,
    LocateFixed,
} from "lucide-react";

interface StatusStyles {
    label: string;
    color: string;
    bg: string;
    dot: string;
    iconBg: string;
    rowBg: string;
}

const TouristsTable = ({ tourists }: { tourists: Tourist[] }) => {
    const MAX_TREK_HOURS = 6;
    const SIGNAL_TIMEOUT_MINUTES = 15;

    // Logic to check if the tourist is taking too long
    const isOverdue = (startTime: string, status: string) => {
        if (status !== "Active") return false;
        const start = new Date(startTime).getTime();
        if (isNaN(start)) return false; // Guard against invalid dates

        const hoursElapsed = (Date.now() - start) / 36e5;
        return hoursElapsed > MAX_TREK_HOURS;
    };

    // Logic to check if device stopped sending pings
    const isSignalLost = (lastPing: string) => {
        const last = new Date(lastPing).getTime();
        if (isNaN(last)) return true; // If no valid date, assume lost

        const minutesElapsed = (Date.now() - last) / 60000;
        return minutesElapsed > SIGNAL_TIMEOUT_MINUTES;
    };

    const getStatusConfig = (t: Tourist): StatusStyles => {
        // 1. Emergency
        if (t.status === "Emergency")
            return {
                label: "Emergency",
                color: "text-[#FF6B35]",
                bg: "bg-[#FF6B35]/10",
                dot: "bg-[#FF6B35] animate-pulse shadow-[0_0_8px_#FF6B35]",
                iconBg: "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20",
                rowBg: "bg-[#FF6B35]/[0.03] hover:bg-[#FF6B35]/[0.08]"
            };

        // 2. Overdue
        if (isOverdue(t.startTime, t.status))
            return {
                label: "Overdue",
                color: "text-[#F5BB00]",
                bg: "bg-[#F5BB00]/10",
                dot: "bg-[#F5BB00] shadow-[0_0_8px_#F5BB00]",
                iconBg: "bg-[#F5BB00] text-white shadow-lg shadow-[#F5BB00]/20",
                rowBg: "bg-[#F5BB00]/[0.02] hover:bg-[#F5BB00]/[0.06]"
            };

        // 3. Completed
        if (t.status === "Completed")
            return {
                label: "Completed",
                color: "text-[#0C8345]",
                bg: "bg-[#0C8345]/10",
                dot: "bg-[#0C8345]",
                iconBg: "bg-[#0C8345] text-white",
                rowBg: "bg-transparent hover:bg-[#F4F4F4]/50"
            };

        // 4. Active Tracking
        if (t.status === "Active")
            return {
                label: "Tracking",
                color: "text-[#0C8345]",
                bg: "bg-[#0C8345]/10",
                dot: "bg-[#0C8345] shadow-[0_0_5px_#0C8345]",
                iconBg: "bg-[#0C1618] text-white", // Premium Dark for Active
                rowBg: "bg-transparent hover:bg-white"
            };

        // 5. Default
        return {
            label: t.status,
            color: "text-[#0C1618]/50",
            bg: "bg-[#0C1618]/5",
            dot: "bg-[#0C1618]/30",
            iconBg: "bg-[#0C1618]/10 text-[#0C1618]/50",
            rowBg: "bg-transparent hover:bg-[#F4F4F4]/50"
        };
    };

    return (
        <div className="w-full bg-[#F4F4F4]/30 backdrop-blur-sm rounded-3xl border border-[#0C1618]/5 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-left">
                    <thead>
                        <tr className="bg-white/60">
                            {[
                                { label: "Tourist Info", icon: User },
                                { label: "Transit", icon: Car },
                                { label: "Destination", icon: MapPin },
                                { label: "Status", icon: ShieldCheck },
                                { label: "Departure", icon: Clock },
                                { label: "Telemetry", icon: Navigation2 },
                            ].map((head, i) => (
                                <th key={i} className="px-8 py-5 border-b border-[#0C1618]/5">
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-black text-[#0C1618]/30">
                                        <head.icon size={13} strokeWidth={3} />
                                        {head.label}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#0C1618]/5">
                        {tourists.map((t) => {

                            const signalLost = isSignalLost(t.lastPing);
                            const status = getStatusConfig(t);

                            return (
                                <tr
                                    key={t.id}
                                    className="group bg-transparent hover:bg-white/80 transition-all duration-300 ease-out"
                                >
                                    <td className="px-8 py-4"> {/* Binawasan ang vertical padding mula 6 to 4 */}
                                        <div className="flex items-center gap-3"> {/* Gap reduced from 4 to 3 */}
                                            <div className="relative">
                                                {/* Avatar size reduced from w-12/h-12 to w-9/h-9 */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${status.iconBg}`}>
                                                    {t.name.charAt(0)}
                                                </div>

                                                {/* Status indicator dot - niliitan din ang size at border */}
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[1.5px] border-white ${status.dot}`} />
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#0C1618] text-[14px] leading-tight group-hover:text-[#FF6B35] transition-colors duration-300">
                                                    {t.name}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-[#0C1618]/20 uppercase tracking-widest">Vehicle</span>
                                            <span className="text-sm font-bold text-[#0C1618]/80">{t.vehicle}</span>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0C1618]/80 text-[14px]">
                                                {t.destination}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0C8345]/40" />
                                                <span className="text-[11px] font-medium text-[#0C1618]/40 uppercase tracking-tighter">Zambales Region</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full ${status.bg} border border-white/50`}>
                                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                            <span className={`text-[11px] font-extrabold uppercase tracking-widest ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-black text-[#0C1618]/70">
                                                {new Date(t.startTime).toLocaleTimeString("en-PH", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                })}
                                            </span>
                                            <span className="text-[10px] text-[#0C1618]/30 font-bold uppercase">24H Departure</span>
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[13px] font-bold ${signalLost ? 'text-[#FF6B35]' : 'text-[#0C1618]/80'}`}>
                                                    {new Date(t.lastPing).toLocaleTimeString("en-PH", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                {/* Only show Signal Lost badge if status is Active but ping is old */}
                                                {signalLost && t.status === "Active" && (
                                                    <div className="flex items-center gap-1 bg-[#FF6B35] text-white px-1.5 py-0.5 rounded text-[9px] font-black uppercase animate-bounce">
                                                        <AlertTriangle size={10} strokeWidth={3} />
                                                        No Signal
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-[#0C1618]/5 w-fit shadow-sm group-hover:border-[#0C1618]/20 transition-colors">
                                                <LocateFixed size={12} className="text-[#0C1618]/20" />
                                                <code className="text-[10px] text-[#0C1618]/40 font-mono tracking-tighter">
                                                    {t.location.lat.toFixed(4)}, {t.location.lng.toFixed(4)}
                                                </code>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TouristsTable;