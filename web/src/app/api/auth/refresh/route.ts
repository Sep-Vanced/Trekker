import { signAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Try cookie first (web/trekker flow)
  let refreshToken = req.cookies.get("refresh_token")?.value;

  // Fall back to request body (admin/Bearer-token flow)
  if (!refreshToken) {
    try {
      const body = await req.json();
      refreshToken = body?.refresh;
    } catch {
      // no body sent — that's fine, refreshToken stays undefined
    }
  }

  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token" }, { status: 401 });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const access = signAccessToken({
      userId: payload.userId,
      role: payload.role,
      username: payload.username,
    });

    const res = NextResponse.json({ access });
    // Only relevant for the cookie-based (web) flow — harmless no-op for admin
    res.cookies.set("access_token", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json(
      { detail: "Invalid refresh token" },
      { status: 401 },
    );
  }
}