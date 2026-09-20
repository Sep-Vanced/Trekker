import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ─── Condition catalog, keyed by a coarse "wetness" bucket ─────────────────
const CONDITIONS = [
  { max: 1, condition: "Clear Skies", icon: "☀️" },
  { max: 2, condition: "Partly Cloudy", icon: "⛅" },
  { max: 3, condition: "Overcast", icon: "☁️" },
  { max: 4, condition: "Partly Cloudy with Scattered Showers", icon: "🌦️" },
  { max: 5, condition: "Heavy Rain", icon: "🌧️" },
] as const;

// Simple deterministic hash so the same route+date always returns the same
// forecast (instead of a random number on every request), while still
// varying per route and per day.
function seedFor(routeId: number, dateKey: string) {
  let hash = 0;
  const str = `${routeId}:${dateKey}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic pseudo-random float in [0, 1) from a seed.
function rand(seed: number, salt: number) {
  const x = Math.sin(seed + salt) * 10000;
  return x - Math.floor(x);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const routeIdParam = searchParams.get("routeId");
  const dateParam = searchParams.get("date"); // expected YYYY-MM-DD

  const routeId = routeIdParam ? parseInt(routeIdParam, 10) : null;
  const date = dateParam ? new Date(dateParam) : new Date();
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { detail: "Invalid date parameter" },
      { status: 400 },
    );
  }
  const dateKey = date.toISOString().slice(0, 10);

  try {
    let route = null;
    if (routeId !== null) {
      if (isNaN(routeId)) {
        return NextResponse.json(
          { detail: "Invalid routeId parameter" },
          { status: 400 },
        );
      }
      route = await prisma.trekRoute.findUnique({ where: { id: routeId } });
      if (!route) {
        return NextResponse.json(
          { detail: "Route not found" },
          { status: 404 },
        );
      }
    }

    // Prefer a real, previously recorded WeatherReport for this route/day if
    // one exists in the DB (e.g. a ranger logged actual conditions).
    if (route) {
      const dayStart = new Date(dateKey);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const recorded = await prisma.weatherReport.findFirst({
        where: {
          route: route.id,
          recorded_at: { gte: dayStart, lt: dayEnd },
        },
        orderBy: { recorded_at: "desc" },
      });

      if (recorded) {
        const alerts: string[] = [];
        if (!recorded.is_safe_to_trek) {
          alerts.push("Conditions reported unsafe for trekking on this date");
        }
        return NextResponse.json({
          status: recorded.is_safe_to_trek ? "Safe" : "Danger",
          condition: recorded.condition_display,
          icon:
            CONDITIONS.find((c) => c.condition === recorded.condition_display)
              ?.icon ?? "⛅",
          temperature: parseFloat(recorded.temperature_c),
          humidity: recorded.humidity_pct,
          windSpeed: parseFloat(recorded.wind_speed_kph),
          rainfall: parseFloat(recorded.rainfall_mm),
          alerts,
          recommendation: recorded.is_safe_to_trek
            ? "Recorded conditions are safe for trekking."
            : "Recorded conditions were flagged unsafe — check with a ranger before heading out.",
          source: "recorded",
        });
      }
    }

    // Otherwise, derive a deterministic forecast from the route's elevation
    // and difficulty (if a route was given) plus the requested date, so the
    // same route/date pair always returns the same forecast instead of a
    // fixed canned response.
    const elevation = route?.elevation_gain_m ?? 300;
    const difficulty = route?.difficulty_score ?? 2;
    const seed = seedFor(route?.id ?? 0, dateKey);

    // Elevation pushes temperature down and wind up.
    const baseTemp = 30 - elevation / 250;
    const temperature = Math.round(
      (baseTemp - rand(seed, 1) * 3 + rand(seed, 2) * 1.5) * 10,
    ) / 10;
    const windSpeed = Math.round(
      10 + elevation / 100 + rand(seed, 3) * 15,
    );
    const humidity = Math.round(60 + rand(seed, 4) * 30);

    // Wetness bucket: more likely to rain on higher-difficulty / higher
    // elevation routes, plus a day-to-day random component.
    const wetness =
      1 + Math.round(rand(seed, 5) * 3) + Math.floor(difficulty / 3);
    const bucket =
      CONDITIONS.find((c) => wetness <= c.max) ??
      CONDITIONS[CONDITIONS.length - 1];
    const rainfall =
      bucket.max <= 2 ? 0 : Math.round(rand(seed, 6) * bucket.max * 8 * 10) / 10;

    const alerts: string[] = [];
    let status: "Safe" | "Caution" | "Danger" = "Safe";

    if (bucket.max >= 4) {
      status = "Caution";
      alerts.push("Rain expected — trail surfaces may be slippery");
    }
    if (bucket.max >= 5 || rainfall > 25) {
      status = "Danger";
      alerts.push("Heavy rainfall expected — river crossings may be unsafe");
    }
    if (windSpeed > 30) {
      status = status === "Safe" ? "Caution" : status;
      alerts.push("Strong winds possible near ridgelines");
    }
    if (route && route.status !== "open") {
      status = route.status === "closed" ? "Danger" : "Caution";
      alerts.push(
        route.status === "closed"
          ? "This route is currently closed"
          : "This route currently has a caution advisory",
      );
    }

    const recommendation =
      status === "Safe"
        ? "Conditions look good for trekking."
        : status === "Caution"
          ? "Trekking is possible but proceed with caution."
          : "Trekking is not recommended under these conditions.";

    return NextResponse.json({
      status,
      condition: bucket.condition,
      icon: bucket.icon,
      temperature,
      humidity,
      windSpeed,
      rainfall,
      alerts,
      recommendation,
      source: "estimated",
    });
  } catch (err) {
    console.error("Navigation weather error:", err);
    return NextResponse.json(
      { detail: "Failed to load weather" },
      { status: 500 },
    );
  }
}