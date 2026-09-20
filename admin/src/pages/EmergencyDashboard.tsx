import EmergencyMetrics from "@components/Emergency/EmergencyMetrics";
import IncidentTypesCard from "@components/Emergency/IncidentTypesCard";
import IncidentMap from "@components/Emergency/IncidentMap";
import IncidentTable from "@components/Emergency/IncidentTable";
import WorkflowPanel from "@components/Emergency/WorkflowPanel";

const EmergencyDashboard = () => {
    return (
        <div className="min-h-screen bg-[#F4F4F4] font-['Plus_Jakarta_Sans',sans-serif] text-[#0C1618] px-6 py-8 md:px-8 md:py-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── HEADER SECTION  ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0C1618]">
                        Emergency <span className="text-[#0C8345]">& Incident</span>
                    </h1>

                    <p className="text-sm font-medium text-[#0C1618]/60 max-w-md leading-relaxed">
                        SOS monitoring and rescue coordination for{" "}
                        <span className="text-[#0C8345] font-bold">San Marcelino</span>.
                        Active tracking for <span className="text-[#FF6B35] font-bold text-xs uppercase ml-1 tracking-wider">Remote Zones</span>.
                    </p>
                </div>
            </div>

            {/* ── METRICS (Spacing updated) ── */}
            <div className="mb-10">
                <EmergencyMetrics />
            </div>

            {/* ── MAIN CONTENT (Premium Container Style) ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* LEFT: Map + Table */}
                <div className="xl:col-span-8 flex flex-col gap-8">

                    {/* Map Card (Using the Rounded 2.5rem style from LiveMap) */}
                    <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-black/5 border border-black/5 overflow-hidden">
                        <div className="h-120 rounded-3xl overflow-hidden border border-black/5">
                            <IncidentMap />
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 flex flex-col overflow-hidden">
                        {/* Table Header */}
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-extrabold text-[#0C1618] tracking-tight">
                                Active Incidents
                            </h2>
                            <span className="bg-[#0C8345]/10 text-[#0C8345] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Live Feed
                            </span>
                        </div>

                        {/* Scrollable Table Area */}
                        <div className="p-4 pt-0 overflow-auto max-h-100">
                            <IncidentTable />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Insights / Controls */}
                <div className="xl:col-span-4 flex flex-col gap-8">

                    {/* Incident Types Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 p-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#0C1618]/40 mb-6">
                            Incident Analysis
                        </h3>
                        <IncidentTypesCard />
                    </div>

                    {/* Workflow Panel */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 p-8 flex-1">
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#0C1618]/40 mb-6">
                            Rescue Workflow
                        </h3>
                        <WorkflowPanel />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmergencyDashboard;