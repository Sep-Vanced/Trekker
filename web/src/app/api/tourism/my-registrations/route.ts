import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const registrations = await prisma.tourismRegistration.findMany({
      where: {
        profile_id: user.id,
        status: { in: ["registered", "overdue"] },
      },
      include: { route: true },
      orderBy: { registered_at: "desc" },
    });

    const results = registrations.map((r) => ({
      id: r.id,
      permit_number: r.permit_number,
      full_name: `${user.first_name} ${user.last_name}`,
      route_name: r.route.name,
      status: r.status,
      group_size: r.group_size,
      age: r.age,
      citizen: r.citizen,
      place: r.place,
      pax: r.pax,
      planned_entry: r.planned_entry.toISOString(),
      planned_exit: r.planned_exit.toISOString(),
      actual_entry: r.actual_entry?.toISOString() ?? null,
      actual_exit: r.actual_exit?.toISOString() ?? null,
      is_overdue: r.is_overdue,
      registered_at: r.registered_at.toISOString(),
    }));

    return NextResponse.json({ count: results.length, results });
  } catch (err) {
    console.error("My registrations error:", err);
    return NextResponse.json(
      { detail: "Failed to load registrations" },
      { status: 500 },
    );
  }
}
