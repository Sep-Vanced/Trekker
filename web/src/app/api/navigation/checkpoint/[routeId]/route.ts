import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ routeId: string }> },
) {
  try {
    const { routeId } = await params;
    const checkpoints = await prisma.checkpoint.findMany({
      where: { route: Number(routeId) },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(checkpoints);
  } catch (err) {
    console.error("Checkpoints error:", err);
    return NextResponse.json(
      { detail: "Failed to load checkpoints" },
      { status: 500 },
    );
  }
}
