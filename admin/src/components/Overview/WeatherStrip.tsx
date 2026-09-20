import { CloudRain, Thermometer, Droplets, Wind, Activity } from "lucide-react";

const WeatherStrip = () => {
  const stats = [
    { icon: <Thermometer size={16} />, val: "26°C", label: "Temp", color: "#0C8345" },
    { icon: <Droplets size={16} />, val: "82%", label: "Humidity", color: "#0C8345" },
    { icon: <Wind size={16} />, val: "18 km/h", label: "Wind", color: "#0C8345" },
    {
      icon: <Activity size={16} />,
      val: "MODERATE",
      label: "Trek Risk",
      isCritical: true,
      color: "#FF6B35",
    },
  ];

  return (
    <div className="bg-white rounded-4xl px-8 py-6 flex flex-wrap items-center justify-between gap-8 shadow-sm border border-black/3">

      {/* ── LEFT: Condition ── */}
      <div className="flex items-center gap-6">
        {/* Solid Icon Container - Clean & Bold */}
        <div className="shrink-0 relative">
          <div className="p-4 rounded-2xl bg-[#0C8345] shadow-lg shadow-[#0C8345]/20 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <CloudRain size={28} className="text-[#F4F4F4]" />
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {/* Elegant Status Dot */}
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5BB00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5BB00]"></span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0C1618]/40 leading-none">
              San Marcelino · Mountain Zone
            </p>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tighter text-[#0C1618] leading-none">
              Partly Cloudy
            </h2>

            {/* Premium Pill Badge */}
            <span className="text-[9px] font-black tracking-widest px-3 py-1 rounded-full bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20 uppercase">
              Rain Advisory
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Stats ── */}
      <div className="flex items-center gap-10">
        {stats.map((w, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 relative group"
          >
            {/* Divider - Ginawang mas subtle */}
            {idx !== 0 && (
              <div className="absolute -left-5 h-10 w-px bg-black/6" />
            )}

            {/* Icon Circle */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: `${w.color}10` }}
            >
              <span style={{ color: w.color }} className="transition-transform group-hover:scale-110 duration-300">
                {w.icon}
              </span>
            </div>

            {/* Data Text */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#0C1618]/30 leading-none mb-1.5">
                {w.label}
              </span>
              <span
                className="text-base font-black tabular-nums tracking-tight text-[#0C1618] leading-none"
                style={w.isCritical ? { color: "#FF6B35" } : {}}
              >
                {w.val}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherStrip;