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
  if (user.role !== "ranger") {
    return NextResponse.json({ detail: "Permission denied" }, { status: 403 });
  }

  try {
    const { qr_payload, action } = await req.json();

    if (!qr_payload || !action) {
      return NextResponse.json(
        { detail: "QR payload and action required" },
        { status: 400 },
      );
    }

    // Parse QR: SMARTTREK|permit|routeId|userId|date
    const parts = qr_payload.split("|");
    if (parts.length < 2 || parts[0] !== "SMARTTREK") {
      return NextResponse.json(
        { detail: "Invalid QR code format" },
        { status: 400 },
      );
    }

    const permitNumber = parts[1];
    const registration = await prisma.tourismRegistration.findUnique({
      where: { permit_number: permitNumber },
      include: { user: true, route: true },
    });

    if (!registration) {
      return NextResponse.json(
        { detail: "Registration not found" },
        { status: 404 },
      );
    }

    if (action === "entry") {
      if (registration.actual_entry) {
        return NextResponse.json(
          { detail: "Entry already recorded for this registration" },
          { status: 400 },
        );
      }
      await prisma.tourismRegistration.update({
        where: { id: registration.id },
        data: { actual_entry: new Date() },
      });
    } else if (action === "exit") {
      if (!registration.actual_entry) {
        return NextResponse.json(
          { detail: "Cannot exit before entry is recorded" },
          { status: 400 },
        );
      }
      const exitTime = new Date();
      const entryTime = registration.actual_entry;
      const durationMs = exitTime.getTime() - entryTime.getTime();
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
    } else {
      return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Traveler ${registration.user.first_name} ${registration.user.last_name} ${action} recorded successfully.`,
      registration: {
        id: registration.id,
        permit_number: registration.permit_number,
        full_name: `${registration.user.first_name} ${registration.user.last_name}`,
        route_name: registration.route.name,
      },
    });
  } catch (err) {
    console.error("Scan QR error:", err);
    return NextResponse.json(
      { detail: "Failed to process QR" },
      { status: 500 },
    );
  }
}
