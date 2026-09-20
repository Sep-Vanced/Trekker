import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ permit: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { permit } = await params;
    const registration = await prisma.tourismRegistration.findUnique({
      where: { permit_number: permit },
    });

    if (!registration) {
      return NextResponse.json(
        { detail: "Registration not found" },
        { status: 404 },
      );
    }

    if (registration.profile_id !== user.id && user.role !== "ranger") {
      return NextResponse.json(
        { detail: "Permission denied" },
        { status: 403 },
      );
    }

    const qrPayload = `SMARTTREK|${registration.permit_number}|${registration.route_id}|${registration.profile_id}|${new Date().toISOString()}`;
    const qr_code = await QRCode.toDataURL(qrPayload);

    await prisma.tourismRegistration.update({
      where: { id: registration.id },
      data: { qr_code },
    });

    return NextResponse.json({
      success: true,
      qr_code: qr_code.replace("data:image/png;base64,", ""),
      message: "QR code regenerated successfully",
    });
  } catch (err) {
    console.error("Regenerate QR error:", err);
    return NextResponse.json(
      { detail: "Failed to regenerate QR" },
      { status: 500 },
    );
  }
}
