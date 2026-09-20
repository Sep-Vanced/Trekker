import React from 'react';
import { Thermometer, CloudRain, Wind, Waves, AlertCircle, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { WEATHER_DATA } from "@data/weather";
import { computeWeatherMetrics } from "@/utils/WeatherMetrics";

// --- Types & Interfaces ---

type RiskLevel = 'Safe' | 'Warning' | 'Danger';

interface StatusDetail {
    color: string;
    bg: string;
    glow: string;
    icon: LucideIcon;
    label: string;
}

interface MetricCardProps {
    label: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    subtitle: string;
    indicatorColor: string;
    shouldPulse?: boolean; // New prop for urgency
}

// --- Configuration ---

const STATUS_CONFIG: Record<RiskLevel, StatusDetail> = {
    Safe: {
        color: "text-[#0C8345]",
        bg: "bg-[#0C8345]/5",
        glow: "shadow-none",
        icon: ShieldCheck,
        label: "Secure"
    },
    Warning: {
        color: "text-[#F5BB00]",
        bg: "bg-[#F5BB00]/5",
        glow: "shadow-[0_0_15px_rgba(245,187,0,0.1)]",
        icon: TriangleAlert,
        label: "Caution"
    },
    Danger: {
        color: "text-[#FF6B35]",
        bg: "bg-[#FF6B35]/5",
        glow: "animate-pulse shadow-[0_0_20px_rgba(255,107,53,0.2)]", // Pulsing glow
        icon: AlertCircle,
        label: "High Risk"
    },
};

// --- Components ---

const MetricCard = ({ label, value, unit, icon, subtitle, indicatorColor, shouldPulse }: MetricCardProps) => (
    <div className="bg-white p-8 rounded-[40px] shadow-sm flex flex-col items-start min-h-55 relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-gray-100">

        {/* Icon Container with optional pulse */}
        <div className={`mb-8 p-4 bg-gray-50 rounded-[22px] shadow-inner transition-transform duration-300 ${shouldPulse ? 'animate-bounce' : 'group-hover:scale-110'}`}>
            {icon}
        </div>

        <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                {label}
            </p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-5xl font-black text-[#0C1618] tracking-tighter">
                    {value}
                </h3>
                <span className="text-xl font-bold text-gray-300">{unit}</span>
            </div>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
            <div className={`w-2 h-2 rounded-full ${indicatorColor} ${shouldPulse ? 'animate-ping' : ''}`} />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">{subtitle}</p>
        </div>
    </div>
);

const WeatherMetrics = () => {
    const metrics = computeWeatherMetrics(WEATHER_DATA);
    const currentRisk = (metrics.overallRisk as RiskLevel) || 'Safe';
    const status = STATUS_CONFIG[currentRisk];
    const StatusIcon = status.icon;

    // Determine if we should show urgent animations
    const isUrgent = currentRisk === 'Danger';

    return (
        <div className="space-y-8">

            {/* Premium Status Bar */}
            <div className={`flex items-center justify-between p-6 px-10 rounded-4xl ${status.bg} ${status.glow} border border-white/10 transition-all duration-700`}>
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${status.bg} ${status.color} shadow-sm`}>
                        <StatusIcon size={28} className={isUrgent ? 'animate-spin-slow' : ''} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-1">Live Environment Audit</p>
                        <p className={`text-2xl font-black ${status.color} tracking-tight`}>
                            {status.label}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">Location</span>
                        <span className="text-xs font-bold text-gray-800">San Marcelino</span>
                    </div>
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.color.replace('text', 'bg')}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${status.color.replace('text', 'bg')}`}></span>
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <MetricCard
                    label="Temperature"
                    value={metrics.avgTemperature.toFixed(0)}
                    unit="°C"
                    icon={<Thermometer size={26} className="text-[#FF6B35]" />}
                    subtitle="Thermal"
                    indicatorColor="bg-[#FF6B35]"
                    shouldPulse={isUrgent && metrics.avgTemperature > 35} // Pulse if hot AND danger
                />

                <MetricCard
                    label="Rainfall"
                    value={metrics.totalRainfall.toString()}
                    unit="mm"
                    icon={<CloudRain size={26} className="text-[#F5BB00]" />}
                    subtitle="Volume"
                    indicatorColor="bg-[#F5BB00]"
                    shouldPulse={isUrgent}
                />

                <MetricCard
                    label="Wind"
                    value={metrics.avgWindSpeed.toFixed(0)}
                    unit="km/h"
                    icon={<Wind size={26} className="text-[#0C8345]" />}
                    subtitle="Speed"
                    indicatorColor="bg-[#0C8345]"
                />

                <MetricCard
                    label="River"
                    value={metrics.maxRiverLevel.toFixed(1)}
                    unit="m"
                    icon={<Waves size={26} className="text-[#0C1618]" />}
                    subtitle="Level"
                    indicatorColor="bg-[#0C1618]"
                    shouldPulse={isUrgent && metrics.maxRiverLevel > 3} // Pulse if high AND danger
                />
            </div>
        </div>
    );
};

export default WeatherMetrics;