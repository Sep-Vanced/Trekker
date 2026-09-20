"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { CampsiteMap } from "@/components/ui/CampsiteMap";
import { getPhaseConfig } from "@/components/ui/PhaseConfig";
import { Campsite } from "@/types/navigation-types";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Locate,
  Map,
  Mountain,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Routes() {
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mapVisible, setMapVisible] = useState(true);

  const fetchCampsites = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/navigation/campsite");
      const data = await res.json();
      const active = Array.isArray(data) ? data.filter((c: Campsite) => c.is_active) : [];
      setCampsites(active);
      if (active.length > 0) setActiveId(active[0].id);
    } catch {
      setError("Failed to load campsites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/navigation/campsite");
        const data = await res.json();
        const active = Array.isArray(data) ? data.filter((c: Campsite) => c.is_active) : [];
        setCampsites(active);
        if (active.length > 0) setActiveId(active[0].id);
      } catch {
        setError("Failed to load campsites. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeIndex = campsites.findIndex((c) => c.id === activeId);
  const activeCampsite = activeIndex !== -1 ? campsites[activeIndex] : null;
  const uniquePhases = [...new Set(campsites.map((c) => c.phase))];

  const goToPrev = () => {
    if (activeIndex > 0) setActiveId(campsites[activeIndex - 1].id);
  };
  const goToNext = () => {
    if (activeIndex < campsites.length - 1)
      setActiveId(campsites[activeIndex + 1].id);
  };

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Expedition Header ─────────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                Explore
              </p>
              <h1 className="text-white text-3xl lg:text-5xl font-display font-bold mt-1 leading-none">
                Campsites
              </h1>
              <p className="text-canopy-200 text-sm mt-3">
                Select your camp destination
              </p>
            </div>
            {!loading && campsites.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 border border-white/10">
                  <Map size={14} className="text-canopy-200" />
                  <span className="text-white/70 text-sm font-bold">
                    {campsites.length} camps
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {uniquePhases.slice(0, 4).map((p) => (
                    <div
                      key={p}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getPhaseConfig(p).mapColor }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop: Side-by-side Map + List ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map panel */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <div className="px-5 py-4 border-b border-bark-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                  <Map size={15} className="text-white" />
                </div>
                <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
                  Map View
                </span>
              </div>
              <button
                onClick={() => setMapVisible(!mapVisible)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-bark-100 text-xs font-semibold text-bark-500 hover:bg-parchment-100"
              >
                <Map size={12} />
                {mapVisible ? "Hide map" : "Show map"}
              </button>
            </div>

            {mapVisible && (
              <div className="h-[400px] lg:h-[500px] bg-topo relative">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
                  </div>
                ) : error ? null : (
                  <>
                    <CampsiteMap
                      campsites={campsites}
                      activeId={activeId}
                      onFocus={setActiveId}
                    />
                    {uniquePhases.length > 0 && (
                      <div className="absolute top-3 left-3 bg-white/90 rounded-lg px-3 py-2 border border-bark-100 shadow-sm">
                        {uniquePhases.map((p) => (
                          <div key={p} className="flex items-center gap-1.5 p-0.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getPhaseConfig(p).mapColor }}
                            />
                            <span className="text-[10px] font-semibold text-bark-700">
                              {p}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-canopy-950/90 rounded-full px-3 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-canopy-400" />
                      <span className="text-canopy-200 text-[11px] font-semibold">
                        {campsites.length} camps plotted
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Nav strip */}
            {!loading && !error && activeCampsite && (
              <div className="border-t border-bark-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToPrev}
                    disabled={activeIndex === 0}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-bark-100 disabled:opacity-30 hover:bg-parchment-100"
                  >
                    <ChevronLeft size={16} className={activeIndex > 0 ? "text-bark-900" : "text-bark-300"} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-bark-900 font-display truncate">
                      {activeCampsite.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${getPhaseConfig(activeCampsite.phase).mapColor}18`,
                          color: getPhaseConfig(activeCampsite.phase).mapColor,
                        }}
                      >
                        {activeCampsite.phase}
                      </span>
                      <span className="text-[11px] text-bark-500">
                        {activeIndex + 1} / {campsites.length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={goToNext}
                    disabled={activeIndex === campsites.length - 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-bark-100 disabled:opacity-30 hover:bg-parchment-100"
                  >
                    <ChevronRight size={16} className={activeIndex < campsites.length - 1 ? "text-bark-900" : "text-bark-300"} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List panel */}
          <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden">
            <div className="h-[3px] bg-canopy-600" />
            <div className="px-5 py-4 border-b border-bark-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                  <Mountain size={15} className="text-white" />
                </div>
                <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700">
                  Available Campsites
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-parchment-100 border border-bark-100">
                <Layers size={12} className="text-bark-500" />
                <span className="text-xs font-bold text-bark-500">
                  {campsites.length} sites
                </span>
              </div>
            </div>

            <div className="p-4 lg:p-5 space-y-3 max-h-[500px] overflow-y-auto">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-bark-100 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-parchment-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-2/3 bg-parchment-100 rounded-full" />
                          <div className="h-2.5 w-full bg-parchment-100 rounded-full" />
                        </div>
                      </div>
                      <div className="h-9 rounded-xl bg-parchment-100" />
                    </div>
                  ))}
                </div>
              )}

              {error && !loading && (
                <div className="rounded-xl bg-rust-100/50 border border-rust-100 p-4 flex items-center gap-2.5">
                  <span className="text-rust-600 text-sm flex-1">{error}</span>
                  <button onClick={fetchCampsites} className="text-rust-600 text-sm font-bold">
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && campsites.length === 0 && (
                <div className="flex flex-col items-center py-12">
                  <Mountain size={28} className="text-bark-300" />
                  <p className="text-[15px] font-bold text-bark-700 mt-3">No campsites found</p>
                  <p className="text-xs text-bark-500 mt-1">Check back later</p>
                </div>
              )}

              {!loading &&
                !error &&
                campsites.map((c) => {
                  const phase = getPhaseConfig(c.phase);
                  const isActive = c.id === activeId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className="rounded-xl overflow-hidden border cursor-pointer transition-all"
                      style={{
                        borderColor: isActive
                          ? `${phase.mapColor}50`
                          : "#ded4bf",
                        boxShadow: isActive
                          ? `0 4px 12px ${phase.mapColor}22`
                          : "0 1px 4px rgba(36,29,20,0.04)",
                      }}
                    >
                      <div className="flex flex-row">
                        <div className="w-1" style={{ backgroundColor: phase.mapColor }} />
                        <div className="flex-1 p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor: isActive
                                  ? phase.mapColor
                                  : phase.accentAlpha,
                              }}
                            >
                              <Mountain
                                size={21}
                                color={isActive ? "white" : phase.mapColor}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-[14px] font-extrabold text-bark-900 font-display truncate">
                                {c.name}
                              </p>
                              <p className="text-[11px] text-bark-500 mt-0.5 line-clamp-2">
                                {c.description}
                              </p>
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center border"
                              style={{
                                backgroundColor: isActive
                                  ? `${phase.mapColor}18`
                                  : "rgba(36,29,20,0.04)",
                                borderColor: isActive
                                  ? `${phase.mapColor}35`
                                  : "rgba(36,29,20,0.07)",
                              }}
                            >
                              <Locate
                                size={13}
                                color={
                                  isActive ? phase.mapColor : "rgba(36,29,20,0.3)"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center mb-3 flex-wrap gap-2">
                            <span
                              className="flex items-center px-2.5 py-1 rounded-full border"
                              style={{
                                backgroundColor: `${phase.mapColor}15`,
                                borderColor: `${phase.mapColor}25`,
                              }}
                            >
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: phase.mapColor }}
                              >
                                {c.phase}
                              </span>
                            </span>
                            <span className="flex items-center px-2.5 py-1 rounded-full bg-canopy-50 border border-canopy-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-canopy-500" />
                              <span className="text-[10px] font-bold text-canopy-700 ml-1">
                                Active
                              </span>
                            </span>
                            <span className="text-[10px] font-medium text-bark-500 ml-auto">
                              {parseFloat(c.latitude).toFixed(4)}°,{" "}
                              {parseFloat(c.longitude).toFixed(4)}°
                            </span>
                          </div>
                          <div className="h-px bg-bark-100 mb-3" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/campsite-routes?campsiteId=${c.id}&campsiteName=${encodeURIComponent(c.name)}&campsitePhase=${encodeURIComponent(c.phase)}`;
                            }}
                            className="w-full rounded-xl py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            style={{
                              backgroundColor: phase.mapColor,
                              boxShadow: `0 2px 6px ${phase.mapColor}40`,
                            }}
                          >
                            <Mountain size={14} color="white" />
                            <span className="text-white text-[13px] font-extrabold">
                              View Routes
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </TabLayout>
  );
}