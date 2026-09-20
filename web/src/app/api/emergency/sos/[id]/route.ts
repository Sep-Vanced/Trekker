import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/emergency/sos/[id] — ranger resolves an SOS alert
export async function PATCH(
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
  if (user.role !== "ranger") {
    return NextResponse.json({ detail: "Permission denied" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const alertId = Number(id);
    if (isNaN(alertId)) {
      return NextResponse.json({ detail: "Invalid alert ID" }, { status: 400 });
    }

    const alert = await prisma.sosAlert.findUnique({
      where: { id: alertId },
    });
    if (!alert) {
      return NextResponse.json({ detail: "Alert not found" }, { status: 404 });
    }

    const updated = await prisma.sosAlert.update({
      where: { id: alertId },
      data: {
        status: "resolved",
        resolved_at: new Date(),
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      resolved_at: updated.resolved_at?.toISOString() ?? null,
      message: "SOS alert resolved",
      success: true,
    });
  } catch (err) {
    console.error("SOS resolve error:", err);
    return NextResponse.json(
      { detail: "Failed to resolve SOS alert" },
      { status: 500 },
    );
  }
}