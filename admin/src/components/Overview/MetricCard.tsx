import { MoveUpRight, MoveDownRight } from "lucide-react";

export interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendVal?: string;
  accent: string;
  glow?: string;
  alert?: boolean;
}

const MetricCard = ({
  icon,
  label,
  value,
  sub,
  trend,
  trendVal,
  accent,
  glow,
  alert,
}: MetricCardProps) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-4xl px-6 py-6
        bg-white border transition-all duration-500 group
        hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1
        ${alert ? "border-[#FF6B35]/30" : "border-black/3"}
      `}
    >
      {/* ── Alert State Background ── */}
      {alert && (
        <div className="absolute inset-0 bg-linear-to-br from-[#FF6B35]/5 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* ── Top Section: Icon & Trend ── */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        {/* Icon Container with Custom Glow */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm"
          style={{
            backgroundColor: glow || `${accent}15`,
            color: accent,
          }}
        >
          {icon}
        </div>

        {/* Trend Indicator */}
        {trend && trendVal && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black tracking-tighter tabular-nums
            ${trend === "up" ? "bg-[#0C8345]/10 text-[#0C8345]" : "bg-[#FF6B35]/10 text-[#FF6B35]"}`}
          >
            {trend === "up" ? <MoveUpRight size={12} /> : <MoveDownRight size={12} />}
            {trendVal}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="space-y-1 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0C1618]/40">
          {label}
        </p>

        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-black text-[#0C1618] tracking-tighter tabular-nums">
            {value}
          </h3>
        </div>

        {/* ── Subtext Footer ── */}
        {sub && (
          <div className="pt-2 mt-2 border-t border-black/3">
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: alert ? "#FF6B35" : "#0C161860" }}
            >
              {sub}
            </p>
          </div>
        )}
      </div>

      {/* ── Alert corner accent ── */}
      {alert && (
        <div className="absolute top-0 right-0 p-2">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#FF6B35] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B35]"></span>
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;