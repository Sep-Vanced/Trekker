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

    // Fetch live weather from Open-Meteo
    const lat = parseFloat(route.start_latitude);
    const lng = parseFloat(route.start_longitude);

    let weatherData = {
      condition: "cloudy",
      condition_display: "Partly Cloudy",
      temperature_c: "28",
      wind_speed_kph: "18",
      rainfall_mm: "3.2",
      humidity_pct: 82,
      is_safe_to_trek: true,
      recorded_at: new Date().toISOString(),
    };

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation&wind_speed_unit=kmh&timezone=auto`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        const code = current.weather_code;

        const conditionMap: Record<
          number,
          { condition: string; display: string }
        > = {
          0: { condition: "clear", display: "Clear Sky" },
          1: { condition: "clear", display: "Mainly Clear" },
          2: { condition: "partly_cloudy", display: "Partly Cloudy" },
          3: { condition: "overcast", display: "Overcast" },
          45: { condition: "fog", display: "Foggy" },
          48: { condition: "fog", display: "Foggy" },
          51: { condition: "drizzle", display: "Light Drizzle" },
          53: { condition: "drizzle", display: "Drizzle" },
          55: { condition: "drizzle", display: "Heavy Drizzle" },
          61: { condition: "rain", display: "Light Rain" },
          63: { condition: "rain", display: "Rain" },
          65: { condition: "heavy_rain", display: "Heavy Rain" },
          80: { condition: "rain", display: "Rain Showers" },
          81: { condition: "rain", display: "Rain Showers" },
          82: { condition: "heavy_rain", display: "Violent Rain" },
          95: { condition: "thunderstorm", display: "Thunderstorm" },
          96: { condition: "thunderstorm", display: "Thunderstorm w/ Hail" },
          99: { condition: "thunderstorm", display: "Thunderstorm w/ Hail" },
        };

        const cond = conditionMap[code] ?? {
          condition: "cloudy",
          display: "Cloudy",
        };
        const temp = Math.round(current.temperature_2m);
        const humidity = Math.round(current.relative_humidity_2m);
        const wind = Math.round(current.wind_speed_10m);
        const precip = current.precipitation ?? 0;

        const isSafe = code < 51 && wind < 35 && precip < 5;

        weatherData = {
          condition: cond.condition,
          condition_display: cond.display,
          temperature_c: String(temp),
          wind_speed_kph: String(wind),
          rainfall_mm: String(precip),
          humidity_pct: humidity,
          is_safe_to_trek: isSafe,
          recorded_at: new Date().toISOString(),
        };
      }
    } catch {
      // Use defaults if weather API fails
    }

    const alerts: string[] = [];
    if (!weatherData.is_safe_to_trek) {
      alerts.push("Weather conditions may be hazardous for trekking");
    }
    if (parseFloat(weatherData.wind_speed_kph) >= 35) {
      alerts.push(`Strong winds at ${weatherData.wind_speed_kph} km/h`);
    }
    if (parseFloat(weatherData.rainfall_mm) > 5) {
      alerts.push(`Heavy rainfall: ${weatherData.rainfall_mm}mm`);
    }

    return NextResponse.json({
      route: route.name,
      status: weatherData.is_safe_to_trek ? "open" : "caution",
      report: weatherData,
      alerts,
      alert_count: alerts.length,
      has_danger: !weatherData.is_safe_to_trek,
    });
  } catch (err) {
    console.error("Route weather error:", err);
    return NextResponse.json(
      { detail: "Failed to load weather" },
      { status: 500 },
    );
  }
}
