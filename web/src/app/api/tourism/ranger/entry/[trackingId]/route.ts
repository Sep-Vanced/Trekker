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

    if (registration.actual_entry) {
      return NextResponse.json(
        { detail: "Entry already recorded" },
        { status: 400 },
      );
    }

    await prisma.tourismRegistration.update({
      where: { id: registration.id },
      data: { actual_entry: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `Entry recorded for ${registration.user.first_name} ${registration.user.last_name}`,
    });
  } catch (err) {
    console.error("Log entry error:", err);
    return NextResponse.json(
      { detail: "Failed to log entry" },
      { status: 500 },
    );
  }
}
