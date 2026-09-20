import { Clock, ShieldAlert, BellRing } from "lucide-react";
import { recentAlerts } from "@data/Overview/Data";

const PALETTE = {
  bg: "#F4F4F4",
  orange: "#FF6B35", // Critical / Emergency
  yellow: "#F5BB00", // Warning
  green: "#0C8345",  // Info / Success
  dark: "#0C1618",   // Text / Background
};

const AlertsFeed = () => {

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/3 flex flex-col h-full group">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#FF6B35]">
            <BellRing size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Feed</span>
          </div>
          <h3 className="text-2xl font-black text-[#0C1618] tracking-tighter">
            Active Alerts
          </h3>
          <p className="text-xs font-medium text-[#0C1618]/30">
            Real-time hazard monitoring
          </p>
        </div>

        <div className="bg-[#F4F4F4] text-[#0C1618] text-[9px] font-black px-3 py-2 rounded-xl border border-black/5 tracking-widest uppercase">
          Live
        </div>
      </div>

      {/* ── Alert List ── */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
        {recentAlerts.map((a, i) => {
          // Color Mapping based on priority
          const isEmergency = a.type === "emergency" || a.type === "critical";
          const isWarning = a.type === "warning";

          const statusColor = isEmergency
            ? PALETTE.orange
            : isWarning
              ? PALETTE.yellow
              : PALETTE.green;

          return (
            <div
              key={i}
              className="group/item relative flex flex-col p-5 bg-[#FCFCFC] border border-black/3 rounded-3xl transition-all duration-300 hover:shadow-md hover:shadow-black/2 hover:-translate-y-0.5"
            >
              {/* Vertical accent bar */}
              <div
                className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full"
                style={{ backgroundColor: statusColor }}
              />

              <div className="flex justify-between items-start gap-4 mb-3">
                <p className="text-[13px] font-bold text-[#0C1618] leading-tight">
                  {a.msg}
                </p>
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{ backgroundColor: `${statusColor}10`, color: statusColor }}
                >
                  <ShieldAlert size={14} strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/3">
                <div className="flex items-center gap-1.5 text-black/30 font-bold text-[10px] uppercase tracking-tighter">
                  <Clock size={12} strokeWidth={3} />
                  {a.time}
                </div>

                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                  style={{ color: statusColor, backgroundColor: `${statusColor}08` }}
                >
                  {a.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsFeed;