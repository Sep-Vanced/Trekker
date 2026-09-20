import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { sessionId } = await params;
    const logs = await prisma.locationLog.findMany({
      where: { session: Number(sessionId) },
      orderBy: { recorded_at: "asc" },
    });

    return NextResponse.json(
      logs.map((l) => ({
        id: l.id,
        latitude: l.latitude,
        longitude: l.longitude,
        recorded_at: l.recorded_at.toISOString(),
        session: l.session,
      })),
    );
  } catch (err) {
    console.error("Get location logs error:", err);
    return NextResponse.json(
      { detail: "Failed to load logs" },
      { status: 500 },
    );
  }
}
