import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { last_known_latitude, last_known_longitude } = await req.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_known_latitude: Number(last_known_latitude),
        last_known_longitude: Number(last_known_longitude),
      },
    });

    return NextResponse.json({ message: "Location updated" });
  } catch (err) {
    console.error("Update location error:", err);
    return NextResponse.json(
      { detail: "Failed to update location" },
      { status: 500 },
    );
  }
}
