import WeatherMetrics from "@components/Weather/WeatherMetrics";
import WeatherMap from "@components/Weather/WeatherMap";
import WeatherTable from "@components/Weather/WeatherTable";
import RiskPanel from "@components/Weather/RiskPanel";
import AutomationPanel from "@components/Weather/AutomationPanel";

const WeatherDashboard = () => {
    return (
        <div className="min-h-screen bg-[#F4F4F4] font-['Plus_Jakarta_Sans',sans-serif] text-[#0C1618] px-6 py-8 md:px-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                        Weather <span className="text-[#0C8345]">& Monitoring</span>
                    </h1>

                    <p className="text-sm font-medium text-[#0C1618]/60 max-w-md leading-relaxed">
                        Real-time environmental monitoring for{" "}
                        <span className="text-[#0C8345] font-bold">San Marcelino</span>.
                        Rainfall, river levels, and upland wind conditions.
                    </p>
                </div>
            </div>

            {/* ── METRICS ── */}
            <div className="mb-10">
                <WeatherMetrics />
            </div>

            {/* ── MAIN GRID (Asymmetric Premium Layout) ── */}
            <div className="flex flex-col gap-8">

                {/* TOP: HERO MAP */}
                <div className="bg-white rounded-[3rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/3">
                    <div className="h-150 rounded-[2.5rem] overflow-hidden border border-black/5">
                        <WeatherMap />
                    </div>
                </div>

                <div className="flex flex-col gap-6">

                    {/* TOP SECTION: Intelligence & Automation (Side-by-Side) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

                        {/* LEFT: RISK PANEL */}
                        <div className="xl:col-span-4 bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                            <div className="px-8 py-6 border-b border-gray-50">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-black tracking-tighter text-[#0C1618]">Risk Intelligence</h3>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Predictive Analysis</p>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <RiskPanel />
                            </div>
                        </div>

                        {/* RIGHT: AUTOMATION ENGINE */}
                        <div className="xl:col-span-8 bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                            <div className="px-8 py-6 border-b border-gray-50">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-black tracking-tighter text-[#0C1618]">Automation Engine</h3>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Autonomous Response Protocol</p>
                            </div>
                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                                <AutomationPanel />
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: WEATHER LOGS (Full Width) */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                        <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter text-[#0C1618]">Weather Logs</h3>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Real-time Station Telemetry</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#0C8345]/5 rounded-full border border-[#0C8345]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0C8345] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0C8345]">System Active</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <WeatherTable />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherDashboard;