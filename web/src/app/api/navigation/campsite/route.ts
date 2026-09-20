import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const campsites = await prisma.campsite.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(campsites);
  } catch (err) {
    console.error("Campsites error:", err);
    return NextResponse.json(
      { detail: "Failed to load campsites" },
      { status: 500 },
    );
  }
}
