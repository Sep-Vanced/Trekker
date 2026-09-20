import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const {
      route_id,
      planned_entry,
      planned_exit,
      group_size,
      age,
      citizen,
      place,
      pax,
      notes,
    } = await req.json();

    if (!route_id || !planned_entry || !planned_exit || !group_size) {
      return NextResponse.json(
        { detail: "Missing required fields" },
        { status: 400 },
      );
    }

    const route = await prisma.trekRoute.findUnique({
      where: { id: Number(route_id) },
    });
    if (!route) {
      return NextResponse.json({ detail: "Route not found" }, { status: 404 });
    }

    // Generate permit number
    const permit_number = `MT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // QR payload: SMARTTREK|TRK-XXXX|routeId|userId|date
    const qrPayload = `SMARTTREK|${permit_number}|${route_id}|${user.id}|${new Date().toISOString()}`;
    const qr_code = await QRCode.toDataURL(qrPayload);

    const registration = await prisma.tourismRegistration.create({
      data: {
        permit_number,
        qr_code,
        profile_id: user.id,
        route_id: Number(route_id),
        group_size: Number(group_size),
        age: age ? Number(age) : null,
        citizen: citizen || null,
        place: place || null,
        pax: pax ? Number(pax) : 1,
        planned_entry: new Date(planned_entry),
        planned_exit: new Date(planned_exit),
        notes: notes || null,
      },
      include: {
        user: true,
        route: true,
      },
    });

    return NextResponse.json(
      {
        id: registration.id,
        permit_number: registration.permit_number,
        qr_code:
          registration.qr_code?.replace("data:image/png;base64,", "") ?? "",
        message: "Registration successful",
        success: true,
        registration: {
          id: registration.id,
          permit_number: registration.permit_number,
          profile_id: registration.profile_id,
          full_name: `${registration.user.first_name} ${registration.user.last_name}`,
          route: {
            id: registration.route.id,
            name: registration.route.name,
            difficulty: registration.route.difficulty,
            status: registration.route.status,
            total_distance_km: registration.route.total_distance_km,
          },
          status: registration.status,
          group_size: registration.group_size,
          age: registration.age,
          citizen: registration.citizen,
          place: registration.place,
          pax: registration.pax,
          planned_entry: registration.planned_entry.toISOString(),
          planned_exit: registration.planned_exit.toISOString(),
          actual_entry: registration.actual_entry?.toISOString() ?? null,
          actual_exit: registration.actual_exit?.toISOString() ?? null,
          is_overdue: registration.is_overdue,
          trek_duration: registration.trek_duration,
          notes: registration.notes,
          registered_at: registration.registered_at.toISOString(),
          updated_at: registration.updated_at.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Register trekker error:", err);
    return NextResponse.json(
      { detail: "Registration failed" },
      { status: 500 },
    );
  }
}
