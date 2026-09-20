import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const session = await prisma.trekkingSession.findUnique({
      where: { id: Number(id) },
    });

    if (!session) {
      return NextResponse.json(
        { detail: "Session not found" },
        { status: 404 },
      );
    }

    if (session.profile !== user.id && user.role !== "ranger") {
      return NextResponse.json(
        { detail: "Permission denied" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      id: session.id,
      started_at: session.started_at.toISOString(),
      ended_at: session.ended_at?.toISOString() ?? null,
      is_active: session.is_active,
      profile: session.profile,
      route: session.route,
    });
  } catch (err) {
    console.error("Get session error:", err);
    return NextResponse.json(
      { detail: "Failed to load session" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const { ended_at } = await req.json();

    const session = await prisma.trekkingSession.findUnique({
      where: { id: Number(id) },
    });

    if (!session) {
      return NextResponse.json(
        { detail: "Session not found" },
        { status: 404 },
      );
    }

    if (session.profile !== user.id && user.role !== "ranger") {
      return NextResponse.json(
        { detail: "Permission denied" },
        { status: 403 },
      );
    }

    const updated = await prisma.trekkingSession.update({
      where: { id: Number(id) },
      data: {
        ended_at: ended_at ? new Date(ended_at) : new Date(),
        is_active: false,
      },
    });

    return NextResponse.json({
      id: updated.id,
      started_at: updated.started_at.toISOString(),
      ended_at: updated.ended_at?.toISOString() ?? null,
      is_active: updated.is_active,
      profile: updated.profile,
      route: updated.route,
    });
  } catch (err) {
    console.error("End session error:", err);
    return NextResponse.json(
      { detail: "Failed to end session" },
      { status: 500 },
    );
  }
}
