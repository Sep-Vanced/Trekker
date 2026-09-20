import { useSosAlerts } from "@/hooks/useSosAlerts";
import { Siren, AlertTriangle, Activity, MapPin } from "lucide-react";

const EmergencyMetrics = () => {
    const { alerts } = useSosAlerts();

    const activeSOS = alerts.filter((a) => a.status === "active").length;
    const totalIncidents = alerts.length;

    // Wala pang "acknowledged" state sa DB natin ngayon — lahat ng active ay
    // itinuturing na "Pending Action" hanggang i-resolve.
    const pending = activeSOS;
    const responding = 0;

    const metrics = [
        {
            label: "Active SOS",
            value: activeSOS,
            icon: Siren,
            color: "text-[#FF6B35]",
            bg: "bg-[#FF6B35]/10",
            description: "Immediate Response",
            isUrgent: activeSOS > 0,
        },
        {
            label: "Pending Action",
            value: pending,
            icon: MapPin,
            color: "text-[#F5BB00]",
            bg: "bg-[#F5BB00]/10",
            description: "Awaiting Dispatch",
            isUrgent: false,
        },
        {
            label: "Responding",
            value: responding,
            icon: Activity,
            color: "text-[#0C8345]",
            bg: "bg-[#0C8345]/10",
            description: "Units On-Site",
            isUrgent: false,
        },
        {
            label: "Total Alerts",
            value: totalIncidents,
            icon: AlertTriangle,
            color: "text-[#0C1618]",
            bg: "bg-[#0C1618]/5",
            description: "Active Queue",
            isUrgent: false,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, index) => (
                <div
                    key={index}
                    className="group relative bg-white rounded-[2.5rem] p-7 border border-black/5 shadow-xl shadow-black/2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-3xl ${m.bg} transition-transform duration-500 group-hover:scale-110`}>
                            <m.icon className={`w-6 h-6 ${m.color}`} strokeWidth={2.5} />
                        </div>
                        {m.isUrgent && (
                            <span className="flex h-3 w-3 mt-2">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-[#FF6B35] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B35]"></span>
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0C1618]/40">
                            {m.label}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h2 className={`text-4xl font-black tracking-tighter ${m.color}`}>
                                {String(m.value).padStart(2, '0')}
                            </h2>
                        </div>
                        <p className="text-[11px] font-bold text-[#0C1618]/60 mt-2 flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${m.color.replace('text-', 'bg-')}`} />
                            {m.description}
                        </p>
                    </div>
                    <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${m.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
            ))}
        </div>
    );
};

export default EmergencyMetrics;