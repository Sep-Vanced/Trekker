import { siteActivity } from "@data/Overview/Data";
import { Activity } from "lucide-react";

const SiteActivityCard = () => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/3 h-full transition-all duration-500 hover:shadow-xl hover:shadow-black/2">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0C8345]">
            <Activity size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Monitoring</span>
          </div>
          <h3 className="text-2xl font-black text-[#0C1618] tracking-tighter">
            Site Capacity
          </h3>
          <p className="text-xs font-medium text-[#0C1618]/40">
            Real-time occupancy per trekking zone
          </p>
        </div>
      </div>

      {/* ── Activity List ── */}
      <div className="flex flex-col gap-8">
        {siteActivity.map((site) => {
          const pct = Math.round((site.visitors / site.capacity) * 100);
          const isWarning = pct > 80;
          const color = isWarning ? "#FF6B35" : "#0C8345";

          return (
            <div key={site.name} className="group relative">
              {/* Top Info */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-4">
                  {/* Icon with Dynamic Glow */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm"
                    style={{
                      color: color,
                      backgroundColor: `${color}10`,
                    }}
                  >
                    {site.icon}
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#0C1618] tracking-tight">
                      {site.name}
                    </p>
                    <p className="text-[10px] text-[#0C1618]/40 font-bold uppercase tracking-widest">
                      {site.barangay}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-lg font-black tabular-nums" style={{ color: color }}>
                      {site.visitors}
                    </span>
                    <span className="text-[10px] text-[#0C1618]/30 font-bold uppercase tracking-tighter">
                      / {site.capacity}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Custom Progress Bar ── */}
              <div className="relative h-2.5 bg-[#F4F4F4] rounded-full overflow-hidden border border-black/2">
                {/* Background Track */}
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-inner"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: isWarning
                      ? `linear-gradient(90deg, #F5BB00, #FF6B35)`
                      : `linear-gradient(90deg, #F4F4F4, #0C8345)`,
                  }}
                />
              </div>

              {/* ── Footer Info ── */}
              <div className="flex justify-between items-center mt-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-[#FF6B35] animate-pulse' : 'bg-[#0C8345]'}`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0C1618]/50">
                    {isWarning ? "Near Capacity" : "Optimal"}
                  </span>
                </div>

                <span
                  className="text-[10px] font-black tabular-nums tracking-widest"
                  style={{ color: color }}
                >
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SiteActivityCard;