import { NextRequest, NextResponse } from "next/server";
import { JwtPayload, verifyAccessToken } from "./jwt";
import { prisma } from "./prisma";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  role: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    // Fall back to access_token cookie (frontend uses cookie auth)
    token = req.cookies.get("access_token")?.value ?? null;
  }

  if (!token) return null;

  try {
    const payload = verifyAccessToken(token) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      emergency_contact_name: user.emergency_contact_name,
      emergency_contact_phone: user.emergency_contact_phone,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { detail: "Authentication required" },
        { status: 401 },
      );
    }
    return handler(req, user);
  };
}

export function requireRole(role: string) {
  return (
    handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>,
  ) => {
    return async (req: NextRequest) => {
      const user = await getAuthUser(req);
      if (!user) {
        return NextResponse.json(
          { detail: "Authentication required" },
          { status: 401 },
        );
      }
      if (user.role !== role) {
        return NextResponse.json(
          { detail: "Permission denied" },
          { status: 403 },
        );
      }
      return handler(req, user);
    };
  };
}