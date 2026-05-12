import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";
import { Role } from "@prisma/client";

export function roleMiddleware(req: NextRequest, allowedRoles: Role[]) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;

  const decoded = verifyAccessToken(token);
  if (!decoded) return null;

  if (!allowedRoles.includes(decoded.role as Role)) {
    return null;
  }

  return decoded;
}

export const PERMISSIONS = {
  TRAINER_ACCESS: [Role.TRAINER, Role.ADMIN, Role.SUPER_ADMIN],
  ADMIN_ACCESS: [Role.ADMIN, Role.SUPER_ADMIN],
  SUPER_ADMIN_ONLY: [Role.SUPER_ADMIN],
};
