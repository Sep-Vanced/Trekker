"use client";

import { TabLayout } from "@/components/trekker/TabLayout";
import { getPhaseConfig } from "@/components/ui/PhaseConfig";
import { Campsite } from "@/types/navigation-types";
import {
  AlertTriangle,
  Car,
  Check,
  ChevronLeft,
  Mountain,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Vehicle = {
  id: string;
  name: string;
  icon: string;
  suitable: string[];
  restrictions: string[];
};

function VehicleCheckContent() {
  const searchParams = useSearchParams();
  const preselectedPhase = searchParams.get("campsitePhase");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [campsitesLoading, setCampsitesLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(
    preselectedPhase,
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/navigation/vehicles");
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : []);
      } catch {
        // silent
      } finally {
        setVehiclesLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/navigation/campsite");
        const data = await res.json();
        setCampsites(
          Array.isArray(data) ? data.filter((c: Campsite) => c.is_active) : [],
        );
      } catch {
        // silent
      } finally {
        setCampsitesLoading(false);
      }
    };
    load();
  }, []);

  // Vehicle "suitable" ids look like "camp_kuta" — match against campsite
  // phase by normalizing both to the same slug shape.
  const phaseSlug = (phase: string) =>
    phase.trim().toLowerCase().replace(/\s+/g, "_");

  const campsiteForPhaseId = (phaseId: string) =>
    campsites.find((c) => `camp_${phaseSlug(c.phase)}` === phaseId);

  const loading = vehiclesLoading || campsitesLoading;

  return (
    <TabLayout>
      <div className="min-h-screen bg-topo">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-expedition rounded-2xl p-6 lg:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
              >
                <ChevronLeft size={16} className="text-white" />
              </Link>
              <div>
                <p className="font-utility text-canopy-300 text-[11px] font-bold uppercase tracking-[0.25em]">
                  Trip Planning
                </p>
                <h1 className="text-white text-2xl lg:text-3xl font-display font-bold mt-1 leading-none">
                  Vehicle Check
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Campsite filter */}
        <div className="bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden mb-6">
          <div className="h-[3px] bg-canopy-600" />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-canopy-700 flex items-center justify-center shrink-0">
                <Mountain size={15} className="text-white" />
              </div>
              <span className="font-utility text-[11px] font-bold uppercase tracking-[0.2em] text-bark-700 whitespace-nowrap">
                Check Suitability For
              </span>
              <span className="flex-1 border-b border-dashed border-bark-300 translate-y-[1px]" />
            </div>

            {campsitesLoading ? (
              <div className="flex items-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
                <span className="text-bark-500 text-xs">Loading camps…</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPhase(null)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                    selectedPhase === null
                      ? "bg-canopy-600 text-white"
                      : "bg-parchment-100 text-bark-500 hover:bg-parchment-200"
                  }`}
                >
                  All Destinations
                </button>
                {campsites.map((c) => {
                  const id = `camp_${phaseSlug(c.phase)}`;
                  const active = selectedPhase === id;
                  const cfg = getPhaseConfig(c.phase);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedPhase(active ? null : id)}
                      className="px-3.5 py-2 rounded-full text-xs font-bold transition-colors border"
                      style={{
                        backgroundColor: active ? cfg.mapColor : "white",
                        borderColor: active ? cfg.mapColor : "#ded4bf",
                        color: active ? "white" : "#6f6350",
                      }}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Vehicles */}
        {vehiclesLoading ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <div className="w-6 h-6 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
            <p className="text-bark-500 text-sm">Loading vehicle options…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => {
              const isSuitable = selectedPhase
                ? vehicle.suitable.includes(selectedPhase)
                : null;
              const suitableCampsites = vehicle.suitable
                .map((id) => campsiteForPhaseId(id))
                .filter((c): c is Campsite => Boolean(c));

              return (
                <div
                  key={vehicle.id}
                  className={`bg-white rounded-xl border border-bark-100 shadow-[0_4px_20px_rgba(36,29,20,0.07)] overflow-hidden transition-colors ${
                    isSuitable === false
                      ? "opacity-60"
                      : isSuitable === true
                        ? "ring-1 ring-canopy-200"
                        : ""
                  }`}
                >
                  <div
                    className="h-[3px]"
                    style={{
                      backgroundColor: isSuitable === false ? "#ded4bf" : "var(--color-canopy-600)",
                    }}
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-parchment-100 flex items-center justify-center text-2xl">
                          {vehicle.icon}
                        </div>
                        <div>
                          <p className="text-bark-900 text-[15px] font-bold font-display">
                            {vehicle.name}
                          </p>
                          {selectedPhase && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {isSuitable ? (
                                <>
                                  <Check size={12} className="text-canopy-600" />
                                  <span className="text-canopy-600 text-[11px] font-semibold">
                                    Suitable
                                  </span>
                                </>
                              ) : (
                                <>
                                  <X size={12} className="text-rust-500" />
                                  <span className="text-rust-500 text-[11px] font-semibold">
                                    Not recommended
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Car size={16} className="text-bark-300" />
                    </div>

                    {!selectedPhase && (
                      <div className="mb-3">
                        <p className="font-utility text-bark-500 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                          Suitable For
                        </p>
                        {suitableCampsites.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {suitableCampsites.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-1 rounded-lg bg-canopy-50 text-canopy-700 text-[11px] font-semibold"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-bark-500 text-[11px]">
                            No routes recommended
                          </span>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl bg-rust-100/50 border border-rust-100 p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle size={11} className="text-rust-500" />
                        <span className="font-utility text-rust-600 text-[10px] font-bold uppercase tracking-widest">
                          Restrictions
                        </span>
                      </div>
                      {vehicle.restrictions.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <span className="text-rust-400 text-xs leading-4 mt-0.5">
                            •
                          </span>
                          <span className="text-rust-600/80 text-xs leading-4 flex-1">
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TabLayout>
  );
}

export default function VehicleCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-topo flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-bark-300 border-t-canopy-600 rounded-full animate-spin" />
        </div>
      }
    >
      <VehicleCheckContent />
    </Suspense>
  );
}
