import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> },
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
    const { trackingId } = await params;
    const { qr_payload } = await req.json();

    const registration = await prisma.tourismRegistration.findUnique({
      where: { permit_number: trackingId },
      include: { user: true },
    });

    if (!registration) {
      return NextResponse.json(
        { detail: "Registration not found" },
        { status: 404 },
      );
    }

    if (!registration.actual_entry) {
      return NextResponse.json(
        { detail: "Cannot exit before entry" },
        { status: 400 },
      );
    }

    const exitTime = new Date();
    const durationMs = exitTime.getTime() - registration.actual_entry.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    await prisma.tourismRegistration.update({
      where: { id: registration.id },
      data: {
        actual_exit: exitTime,
        status: "completed",
        trek_duration: duration,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Exit recorded for ${registration.user.first_name} ${registration.user.last_name}`,
    });
  } catch (err) {
    console.error("Log exit error:", err);
    return NextResponse.json({ detail: "Failed to log exit" }, { status: 500 });
  }
}
