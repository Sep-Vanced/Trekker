import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campsiteId: string }> },
) {
  try {
    const { campsiteId } = await params;
    const routes = await prisma.trekRoute.findMany({
      where: { destination: Number(campsiteId) },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(routes);
  } catch (err) {
    console.error("Routes by campsite error:", err);
    return NextResponse.json(
      { detail: "Failed to load routes" },
      { status: 500 },
    );
  }
}
