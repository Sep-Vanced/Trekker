import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import MapView from "@components/LiveMap/MapContainer";
import AdminControls from "@/components/LiveMap/AdminControls";
import LayerControls from "@/components/LiveMap/LayerControls";
import type { LayerState } from "@/types/map";

const LiveMap = () => {
  const [layers, setLayers] = useState<LayerState>({
    trekkers: true,
    hazards: true,
    camps: true,
  });

  const [adminActions, setAdminActions] = useState({
    lakeClosed: false,
    uplandRestricted: false,
    evacuation: false,
  });

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-['Plus_Jakarta_Sans',sans-serif] text-[#0C1618] px-6 py-8 md:px-8 md:py-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3">
          {/* Page Title: Simplified to match Sidebar Tab */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0C1618]">
            Live <span className="text-[#0C8345]">Map</span>
          </h1>

          {/* Subheader: Added Location and refined the safety text */}
          <p className="text-sm font-medium text-[#0C1618]/60 max-w-md leading-relaxed">
            Real-time safety monitoring for <span className="text-[#0C8345] font-bold">San Marcelino, Zambales</span>.
            Tracking <span className="text-[#FF6B35] font-bold text-xs uppercase ml-1 tracking-wider">Trekker Activity</span> and mountain zones.
          </p>
        </div>
      </div>

      {/* ── MAIN MAP INTERFACE ── */}
      <div className="flex flex-col h-screen min-h-162.5 bg-white rounded-[2.5rem] p-4 shadow-xl shadow-black/2 border border-black/5 relative overflow-hidden">

        <div className="absolute top-8 left-8 z-1000 w-64">
          <LayerControls layers={layers} setLayers={setLayers} />
        </div>

        {/* Admin Quick Controls Floating Bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-1000 w-fit whitespace-nowrap">
          <AdminControls actions={adminActions} setActions={setAdminActions} />
        </div>

        {/* Status Restricted Badge */}
        {adminActions.uplandRestricted && (
          <div className="absolute bottom-8 left-8 z-1000 bg-[#FF6B35] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-pulse">
            <ShieldAlert size={18} className="text-white" />
            <span className="text-white text-[11px] font-black uppercase tracking-[0.2em]">Upland Restricted</span>
          </div>
        )}

        {/* The Map Container */}
        <div className="flex-1 rounded-4xl overflow-hidden border border-black/3">
          <MapView layers={layers} adminActions={adminActions} />
        </div>
      </div>
    </div>
  );
};

export default LiveMap;