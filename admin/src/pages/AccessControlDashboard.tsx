import TerrainStatus from "@components/AccessControl/TerrainStatus";
import VehicleRules from "@components/AccessControl/VehicleRules";
import SystemControl from "@components/AccessControl/SystemControl";

const AccessControlDashboard = () => {
    return (
        <div className="min-h-screen bg-[#F4F4F4] font-['Plus_Jakarta_Sans',sans-serif] text-[#0C1618] px-6 py-8 md:px-8 md:py-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── HEADER SECTION ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0C1618]">
                        Access <span className="text-[#0C8345]">& Vehicle Control</span>
                    </h1>

                    <p className="text-sm font-medium text-[#0C1618]/60 max-w-md leading-relaxed">
                        Autonomous gate logic and terrain monitoring for{" "}
                        <span className="text-[#0C8345] font-bold">Mapanuepe Access Roads</span>.
                        Managing <span className="text-[#FF6B35] font-bold text-xs uppercase ml-1 tracking-wider">Lahar Routes</span> and vehicle safety.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

                    {/* LEFT: TERRAIN STATUS (8 Columns) */}
                    <div className="xl:col-span-8 bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                        <div className="px-8 py-6 border-b border-gray-50">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-black tracking-tighter text-[#0C1618]">Terrain Intelligence</h3>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Real-time Route Analysis</p>
                        </div>
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                            <TerrainStatus />
                        </div>
                    </div>

                    {/* RIGHT: SYSTEM CONTROL (4 Columns) */}
                    <div className="xl:col-span-4 bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                        <div className="px-8 py-6 border-b border-gray-50">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-2xl font-black tracking-tighter text-[#0C1618]">System Protocol</h3>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Manual Override & Automation</p>
                        </div>
                        <div className="p-8 flex-1 bg-slate-50/30">
                            <SystemControl />
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: VEHICLE MATRIX (Full Width) */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10">
                    <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl font-black tracking-tighter text-[#0C1618]">Vehicle Entry Matrix</h3>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Classification & Access Policies</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#0C8345]/5 rounded-full border border-[#0C8345]/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0C8345] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0C8345]">Logic Active</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <VehicleRules />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessControlDashboard;