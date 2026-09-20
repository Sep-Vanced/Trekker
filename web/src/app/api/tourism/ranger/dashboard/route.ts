import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Distance between two lat/lng points, in meters.
function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeTrekkers, entriesToday, exitsToday, totalRegistrations] =
      await Promise.all([
        prisma.trekkingSession.count({ where: { is_active: true } }),
        prisma.tourismRegistration.count({
          where: { actual_entry: { gte: today } },
        }),
        prisma.tourismRegistration.count({
          where: { actual_exit: { gte: today } },
        }),
        prisma.tourismRegistration.count(),
      ]);

    // ── Active SOS alerts ──────────────────────────────────────────────────
    const sosAlerts = await prisma.sosAlert.findMany({
      where: { status: "active" },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            phone: true,
            emergency_contact_phone: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // ── Hazard detection ────────────────────────────────────────────────
    // For every active trekking session, look at its most recent
    // LocationLog entry and check whether it falls within radius_meters
    // of a danger/emergency checkpoint on that session's route.
    const activeSessionsFull = await prisma.trekkingSession.findMany({
      where: { is_active: true },
      include: {
        user: true,
        trekRoute: { include: { checkpoints: true } },
      },
    });

    const hazardAlerts: Array<{
      session_id: number;
      trekker_name: string;
      route_id: number;
      route_name: string;
      checkpoint_name: string;
      cp_type: string;
      alert_message: string;
      distance_meters: number;
      recorded_at: string;
    }> = [];

    for (const session of activeSessionsFull) {
      const dangerCheckpoints = session.trekRoute.checkpoints.filter(
        (cp) => cp.cp_type === "danger" || cp.cp_type === "emergency",
      );
      if (dangerCheckpoints.length === 0) continue;

      const latestLog = await prisma.locationLog.findFirst({
        where: { session: session.id },
        orderBy: { recorded_at: "desc" },
      });
      if (!latestLog) continue;

      const lat = parseFloat(latestLog.latitude);
      const lon = parseFloat(latestLog.longitude);
      if (isNaN(lat) || isNaN(lon)) continue;

      for (const cp of dangerCheckpoints) {
        const cpLat = parseFloat(cp.latitude);
        const cpLon = parseFloat(cp.longitude);
        if (isNaN(cpLat) || isNaN(cpLon)) continue;

        const dist = distanceMeters(lat, lon, cpLat, cpLon);
        if (dist <= cp.radius_meters) {
          hazardAlerts.push({
            session_id: session.id,
            trekker_name:
              `${session.user.first_name} ${session.user.last_name}`.trim() ||
              session.user.username,
            route_id: session.route,
            route_name: session.trekRoute.name,
            checkpoint_name: cp.name,
            cp_type: cp.cp_type,
            alert_message:
              cp.alert_message ?? "Trekker is near a hazard zone.",
            distance_meters: Math.round(dist),
            recorded_at: latestLog.recorded_at.toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      active_trekkers: activeTrekkers,
      entries_today: entriesToday,
      exits_today: exitsToday,
      total_registrations: totalRegistrations,
      hazard_alerts: hazardAlerts,
      sos_alerts: sosAlerts.map((a) => ({
        id: a.id,
        profile_id: a.profile_id,
        latitude: a.latitude,
        longitude: a.longitude,
        message: a.message,
        status: a.status,
        created_at: a.created_at.toISOString(),
        trekker: {
          name: `${a.user.first_name} ${a.user.last_name}`.trim() || a.user.username,
          username: a.user.username,
          phone: a.user.phone,
          emergency_contact_phone: a.user.emergency_contact_phone,
        },
      })),
    });
  } catch (err) {
    console.error("Ranger dashboard error:", err);
    return NextResponse.json(
      { detail: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}