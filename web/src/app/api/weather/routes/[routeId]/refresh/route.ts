import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ routeId: string }> },
) {
  try {
    const { routeId } = await params;
    const route = await prisma.trekRoute.findUnique({
      where: { id: Number(routeId) },
    });

    if (!route) {
      return NextResponse.json({ detail: "Route not found" }, { status: 404 });
    }

    const lat = parseFloat(route.start_latitude);
    const lng = parseFloat(route.start_longitude);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&wind_speed_unit=kmh&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { detail: "Weather service unavailable" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const current = data.current;
    const code = current.weather_code;

    const conditionMap: Record<number, string> = {
      0: "clear",
      1: "clear",
      2: "partly_cloudy",
      3: "overcast",
      45: "fog",
      48: "fog",
      51: "drizzle",
      53: "drizzle",
      55: "drizzle",
      61: "rain",
      63: "rain",
      65: "heavy_rain",
      80: "rain",
      81: "rain",
      82: "heavy_rain",
      95: "thunderstorm",
      96: "thunderstorm",
      99: "thunderstorm",
    };

    const condition = conditionMap[code] ?? "cloudy";
    const temperature_c = String(Math.round(current.temperature_2m));
    const wind_speed_kph = String(Math.round(current.wind_speed_10m));
    const rainfall_mm = String(current.precipitation ?? 0);
    const humidity_pct = String(Math.round(current.relative_humidity_2m));

    const isSafe =
      code < 51 && Number(wind_speed_kph) < 35 && Number(rainfall_mm) < 5;

    const reasons: string[] = [];
    if (code >= 95) reasons.push("Thunderstorm detected");
    if (code >= 65) reasons.push("Heavy rainfall");
    if (Number(wind_speed_kph) >= 35)
      reasons.push(`Wind speed ${wind_speed_kph} km/h`);
    if (Number(rainfall_mm) > 5) reasons.push(`Rainfall ${rainfall_mm}mm`);

    const alerts: string[] = [];
    if (!isSafe) {
      alerts.push("Weather conditions are not safe for trekking");
      if (reasons.length > 0) alerts.push(...reasons);
    }

    return NextResponse.json({
      route: route.name,
      is_safe: isSafe,
      profile: "Mapanuepe Trail",
      weather: {
        condition,
        temperature_c,
        wind_speed_kph,
        rainfall_mm,
        humidity_pct,
      },
      reasons,
      alerts,
    });
  } catch (err) {
    console.error("Refresh weather error:", err);
    return NextResponse.json(
      { detail: "Failed to refresh weather" },
      { status: 500 },
    );
  }
}
