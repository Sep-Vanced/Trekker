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
    const { route_id } = await req.json();
    if (!route_id) {
      return NextResponse.json(
        { detail: "Route ID required" },
        { status: 400 },
      );
    }

    const session = await prisma.trekkingSession.create({
      data: {
        profile: user.id,
        route: Number(route_id),
        is_active: true,
      },
    });

    return NextResponse.json(
      {
        message: "Session created",
        session_id: session.id,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create session error:", err);
    return NextResponse.json(
      { detail: "Failed to create session" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const sessions = await prisma.trekkingSession.findMany({
      where: { profile: user.id },
      orderBy: { started_at: "desc" },
    });

    return NextResponse.json(
      sessions.map((s) => ({
        id: s.id,
        started_at: s.started_at.toISOString(),
        ended_at: s.ended_at?.toISOString() ?? null,
        is_active: s.is_active,
        profile: s.profile,
        route: s.route,
      })),
    );
  } catch (err) {
    console.error("Get sessions error:", err);
    return NextResponse.json(
      { detail: "Failed to load sessions" },
      { status: 500 },
    );
  }
}
