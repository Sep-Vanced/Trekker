import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { detail: "Username and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return NextResponse.json(
        { detail: "Invalid credentials" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { detail: "Invalid credentials" },
        { status: 401 },
      );
    }

    const payload = {
      userId: user.id,
      role: user.role,
      username: user.username,
    };
    const access = signAccessToken(payload);
    const refresh = signRefreshToken(payload);

    const userData = {
      id: String(user.id),
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone ?? "",
      emergency_contact_name: user.emergency_contact_name ?? "",
      emergency_contact_phone: user.emergency_contact_phone ?? "",
      role: user.role,
    };

    const res = NextResponse.json({ user: userData, access, refresh });
    res.cookies.set("access_token", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });
    res.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ detail: "Login failed" }, { status: 500 });
  }
}
