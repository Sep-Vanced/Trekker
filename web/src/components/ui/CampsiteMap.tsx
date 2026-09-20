"use client";

import { Campsite } from "@/types/navigation-types";
import dynamic from "next/dynamic";

// Dynamically import the actual map component to avoid SSR issues with leaflet
const CampsiteMapClient = dynamic(() => import("./CampsiteMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#e4ede4]">
      <div className="w-5 h-5 border-2 border-slate-300 border-t-forest-600 rounded-full animate-spin" />
    </div>
  ),
});

export function CampsiteMap({
  campsites,
  activeId,
  onFocus,
}: {
  campsites: Campsite[];
  activeId: number | null;
  onFocus: (id: number) => void;
}) {
  if (campsites.length === 0) return null;

  return (
    <CampsiteMapClient
      campsites={campsites}
      activeId={activeId}
      onFocus={onFocus}
    />
  );
}
