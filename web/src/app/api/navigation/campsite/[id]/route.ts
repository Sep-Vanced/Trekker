import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campsite = await prisma.campsite.findUnique({
      where: { id: Number(id) },
    });
    if (!campsite) {
      return NextResponse.json(
        { detail: "Campsite not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(campsite);
  } catch (err) {
    console.error("Campsite detail error:", err);
    return NextResponse.json(
      { detail: "Failed to load campsite" },
      { status: 500 },
    );
  }
}
