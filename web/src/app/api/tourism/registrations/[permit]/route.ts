import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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
      include: { user: true, route: true },
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

    return NextResponse.json({
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
      notes: registration.notes ?? "",
      registered_at: registration.registered_at.toISOString(),
      updated_at: registration.updated_at.toISOString(),
    });
  } catch (err) {
    console.error("Registration detail error:", err);
    return NextResponse.json(
      { detail: "Failed to load registration" },
      { status: 500 },
    );
  }
}
