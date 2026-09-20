import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      password,
      email,
      first_name,
      last_name,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
    } = body;

    if (
      !username ||
      !password ||
      !email ||
      !first_name ||
      !last_name ||
      !phone
    ) {
      return NextResponse.json(
        { detail: "All required fields must be filled" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { detail: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return NextResponse.json(
        { detail: "Username or email already exists" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
        email,
        first_name,
        last_name,
        role: "trekker",
        phone,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        offline_maps_downloaded: false,
      },
    });

    return NextResponse.json(
      { message: "Registration successful", user_id: user.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { detail: "Registration failed" },
      { status: 500 },
    );
  }
}
