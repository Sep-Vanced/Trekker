import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ routeId: string }> },
) {
  try {
    const { routeId } = await params;
    const route = await prisma.trekRoute.findUnique({
      where: { id: Number(routeId) },
    });
    if (!route) {
      return NextResponse.json({ detail: "Route not found" }, { status: 404 });
    }
    return NextResponse.json(route);
  } catch (err) {
    console.error("Route detail error:", err);
    return NextResponse.json(
      { detail: "Failed to load route" },
      { status: 500 },
    );
  }
}
