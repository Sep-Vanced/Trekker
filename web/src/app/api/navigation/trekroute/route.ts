import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/navigation/trekroute
// Lists all active routes with real status + distance, for dashboard/overview
// screens. Distinct from /api/navigation/trekroute/detail/[routeId] (single
// route detail) and /api/navigation/trekroute/[campsiteId] (routes for one
// campsite) — this returns everything at once.
export async function GET() {
  try {
    const routes = await prisma.trekRoute.findMany({
      where: { is_active: true },
      orderBy: { id: "asc" },
      include: { campsite: true },
    });

    return NextResponse.json(
      routes.map((r) => ({
        id: r.id,
        name: r.name,
        difficulty: r.difficulty,
        status: r.status,
        total_distance_km: r.total_distance_km,
        campsite_name: r.campsite.name,
      })),
    );
  } catch (err) {
    console.error("Trek routes list error:", err);
    return NextResponse.json(
      { detail: "Failed to load routes" },
      { status: 500 },
    );
  }
}