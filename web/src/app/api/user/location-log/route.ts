import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { session, latitude, longitude } = await req.json();

    if (!session || !latitude || !longitude) {
      return NextResponse.json(
        { detail: "Missing required fields" },
        { status: 400 },
      );
    }

    const trekSession = await prisma.trekkingSession.findUnique({
      where: { id: Number(session) },
    });

    if (!trekSession || trekSession.profile !== user.id) {
      return NextResponse.json(
        { detail: "Session not found" },
        { status: 404 },
      );
    }

    const log = await prisma.locationLog.create({
      data: {
        session: Number(session),
        latitude: String(latitude),
        longitude: String(longitude),
      },
    });

    return NextResponse.json(
      {
        id: log.id,
        latitude: log.latitude,
        longitude: log.longitude,
        recorded_at: log.recorded_at.toISOString(),
        session: log.session,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Log location error:", err);
    return NextResponse.json(
      { detail: "Failed to log location" },
      { status: 500 },
    );
  }
}
