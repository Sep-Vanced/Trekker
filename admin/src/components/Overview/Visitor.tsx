import { visitorData } from "@data/Overview/Data";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

const VisitorChart = () => {
  const max = useMemo(() =>
    Math.max(...visitorData.map((d) => d.mapanuepe + d.pimmayong)),
    []
  );

  const chartMaxHeight = 180;

  return (
    <div className="bg-[#FCFCFC] rounded-xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#EFEFEF] relative overflow-hidden group">

      {/* ── Background Accent ── */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0C8345]/5 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#0C8345]">
            <TrendingUp size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Analytics Hub</span>
          </div>
          <h3 className="text-2xl font-black text-[#0C1618] tracking-tighter">
            Visitor Trends
          </h3>
          <p className="text-xs font-semibold text-[#0C1618]/30 uppercase tracking-widest">
            Primary Mountain Zone Distribution
          </p>
        </div>

        {/* ── Sharp Legend ── */}
        <div className="flex gap-px bg-[#EFEFEF] p-px border border-[#EFEFEF]">
          {[
            { color: "#0C8345", label: "Mapanuepe" },
            { color: "#F5BB00", label: "Pimmayong" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-3 px-4 py-2 bg-white">
              <div className="w-3 h-3" style={{ background: l.color }} />
              <span className="text-[10px] font-bold text-[#0C1618]/60 uppercase tracking-tighter">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart Area ── */}
      <div className="relative flex items-end gap-2 md:gap-4 h-50 mt-4 px-2">

        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-black/5 w-full" />
          ))}
        </div>

        {visitorData.map((d) => {
          const total = d.mapanuepe + d.pimmayong;
          const mapH = (d.mapanuepe / max) * chartMaxHeight;
          const pimH = (d.pimmayong / max) * chartMaxHeight;
          const isToday = d.day === "Sun"; // Adjust logic as needed

          return (
            <div key={d.day} className="flex-1 flex flex-col items-center group/bar relative z-10">

              {/* Square Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0C1618] text-white px-2 py-1 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30">
                <span className="text-[9px] font-bold tracking-widest uppercase">{total} Units</span>
              </div>

              {/* Sharp Bar Stack */}
              <div className="w-full max-w-11.25 flex flex-col justify-end gap-0.5 h-45 mb-4 transition-transform duration-300 group-hover/bar:-translate-y-1">

                {/* Pimmayong (Top) */}
                <div
                  className={`w-full transition-all duration-500 border-t border-white/20 ${isToday ? 'opacity-100' : 'opacity-20'}`}
                  style={{
                    height: `${pimH}px`,
                    backgroundColor: "#F5BB00",
                  }}
                />

                {/* Mapanuepe (Bottom) */}
                <div
                  className={`w-full transition-all duration-500 border-t border-white/10 ${isToday ? 'opacity-100' : 'opacity-20'}`}
                  style={{
                    height: `${mapH}px`,
                    backgroundColor: "#0C8345",
                  }}
                />
              </div>

              {/* X-Axis Label */}
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-black tracking-widest uppercase ${isToday ? "text-[#0C1618]" : "text-[#0C1618]/20"}`}>
                  {d.day}
                </span>
                <div className={`w-full h-0.5 ${isToday ? "bg-[#0C1618]" : "bg-transparent"}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitorChart;