import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/emergency/sos — trekker sends an SOS alert
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { latitude, longitude, message } = await req.json();

    const alert = await prisma.sosAlert.create({
      data: {
        profile_id: user.id,
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        message: message || null,
        status: "active",
      },
      include: { user: true },
    });

    return NextResponse.json(
      {
        id: alert.id,
        status: alert.status,
        created_at: alert.created_at.toISOString(),
        message: "SOS alert sent successfully",
        success: true,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("SOS send error:", err);
    return NextResponse.json(
      { detail: "Failed to send SOS alert" },
      { status: 500 },
    );
  }
}

// GET /api/emergency/sos — ranger fetches active SOS alerts
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const alerts = await prisma.sosAlert.findMany({
      where: { status: "active" },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            phone: true,
            emergency_contact_name: true,
            emergency_contact_phone: true,
            last_known_latitude: true,
            last_known_longitude: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      results: alerts.map((a) => ({
        id: a.id,
        profile_id: a.profile_id,
        latitude: a.latitude,
        longitude: a.longitude,
        message: a.message,
        status: a.status,
        created_at: a.created_at.toISOString(),
        resolved_at: a.resolved_at?.toISOString() ?? null,
        trekker: {
          id: a.user.id,
          name: `${a.user.first_name} ${a.user.last_name}`.trim() || a.user.username,
          username: a.user.username,
          phone: a.user.phone,
          emergency_contact_name: a.user.emergency_contact_name,
          emergency_contact_phone: a.user.emergency_contact_phone,
          last_known_latitude: a.user.last_known_latitude,
          last_known_longitude: a.user.last_known_longitude,
        },
      })),
    });
  } catch (err) {
    console.error("SOS fetch error:", err);
    return NextResponse.json(
      { detail: "Failed to load SOS alerts" },
      { status: 500 },
    );
  }
}