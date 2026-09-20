import { useState, useEffect } from "react";
import {
  Users,
  Tent,
  AlertTriangle,
  Siren,
  TrendingUp,
  MapPin,
} from "lucide-react";

import MetricCard from "@components/Overview/MetricCard";
import WeatherStrip from "@components/Overview/WeatherStrip";
import VisitorChart from "@components/Overview/Visitor";
import MapWidget from "@components/Overview/MapWidget";
import SiteActivityCard from "@components/Overview/SiteActivityCard";
import AlertsFeed from "@components/Overview/AlertsFeed";
import type { MetricCardProps } from "@/types/Overview";

// ── Updated Metric definitions with your palette ────────────────────────
const METRICS: MetricCardProps[] = [
  {
    icon: <Users size={18} />,
    label: "Total Visitors Today",
    value: "248",
    sub: "+12% vs yesterday",
    trend: "up",
    trendVal: "12%",
    accent: "#0C8345", // Brand Green
    glow: "transparent",
  },
  {
    icon: <TrendingUp size={18} />,
    label: "Active Trekkers",
    value: "67",
    sub: "Mt. Pimmayong trail",
    trend: "up",
    trendVal: "8%",
    accent: "#0C8345",
    glow: "transparent",
  },
  {
    icon: <Tent size={18} />,
    label: "Most Visited Site",
    value: "Mapanuepe",
    sub: "Lake campsite",
    accent: "#F5BB00", // Yellow for highlight
    glow: "transparent",
  },
  {
    icon: <AlertTriangle size={18} />,
    label: "Active Alerts",
    value: "3",
    sub: "2 critical · 1 advisory",
    trend: "up",
    trendVal: "2",
    accent: "#FF6B35", // Brand Orange
    glow: "#FFE1D6", // 15% opacity version of orange
    alert: true,
  },
  {
    icon: <Siren size={18} />,
    label: "Emergency Incidents",
    value: "1",
    sub: "Lahar flow warning",
    trend: "up",
    trendVal: "1",
    accent: "#FF6B35",
    glow: "#FFE1D6",
    alert: true,
  }
];

const OverviewDashboard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-['Plus_Jakarta_Sans',sans-serif] text-[#0C1618] px-6 py-6 md:px-8 md:py-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-[#0C8345] px-3 py-1 rounded-full w-fit shadow-lg shadow-[#0C8345]/20">
            <MapPin size={12} className="text-[#F4F4F4]" />
            <span className="text-[10px] font-black text-[#F4F4F4] tracking-widest uppercase">
              San Marcelino Tourism & Safety
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0C1618]">
            Overview <span className="text-[#0C8345]">Dashboard</span>
          </h1>

          <p className="text-sm font-medium text-[#0C1618]/60 max-w-md">
            Real-time monitoring of <span className="text-[#FF6B35] font-bold text-xs uppercase ml-1 tracking-wider">Trekker safety</span> and mountain zone activity.
          </p>
        </div>

        {/* Live Clock Component */}
        <div className="bg-white p-6 rounded-4xl shadow-sm border border-black/5 min-w-60">
          <div className="text-right flex flex-col items-end">
            <div className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter leading-none text-[#0C8345] flex items-baseline justify-end">
              <span>
                {time.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: true }).split(' ')[0]}
              </span>
              <span className="text-lg md:text-xl font-medium opacity-40 ml-0.5">
                :{time.toLocaleTimeString("en-PH", { second: "2-digit" })}
              </span>
              <span className="text-xs md:text-sm font-black uppercase ml-1.5 tracking-widest text-[#0C1618]/80">
                {time.getHours() >= 12 ? 'PM' : 'AM'}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/5 border border-[#FF6B35]/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-[#FF6B35] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF6B35]"></span>
              </span>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#FF6B35]">
                {time.toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Weather Strip (Sticks to top on scroll for utility) ── */}
      <div className="sticky top-6 z-30 mb-8">
        <WeatherStrip />
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Analytical Data */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-black/5 overflow-hidden">
            <VisitorChart />
          </div>
          <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-black/5 overflow-hidden">
            <SiteActivityCard />
          </div>
        </div>

        {/* Right Column: Tactical / Live Data */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white">
            <MapWidget />
          </div>
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white">
            <AlertsFeed />
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewDashboard;