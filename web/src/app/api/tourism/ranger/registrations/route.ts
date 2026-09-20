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
  if (user.role !== "ranger") {
    return NextResponse.json({ detail: "Permission denied" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("page_size") || "20");

    const [total, registrations] = await Promise.all([
      prisma.tourismRegistration.count(),
      prisma.tourismRegistration.findMany({
        include: { user: true, route: true },
        orderBy: { registered_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const results = registrations.map((r) => ({
      id: r.id,
      permit_number: r.permit_number,
      name: `${r.user.first_name} ${r.user.last_name}`,
      username: r.user.username,
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

    return NextResponse.json({
      count: total,
      page,
      page_size: pageSize,
      pages: Math.ceil(total / pageSize),
      results,
    });
  } catch (err) {
    console.error("Ranger registrations error:", err);
    return NextResponse.json(
      { detail: "Failed to load registrations" },
      { status: 500 },
    );
  }
}
