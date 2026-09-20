"use client";

import dynamic from "next/dynamic";

const RouteMapClient = dynamic(() => import("./RouteMapClient"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <span className="text-sm text-gray-400">Loading map...</span>
    </div>
  ),
});

export default RouteMapClient;