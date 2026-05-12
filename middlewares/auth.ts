import { NextRequest } from "next/server";
import { verifyAccessToken } from "../utils/jwt";

export const authMiddleware = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);
  return decoded as { userId: string, role?: string, name?: string } | null;
};

interface DecodedToken {
  userId: string;
  role?: string;
  name?: string;
}

export const checkRole = (decoded: DecodedToken | null, allowedRoles: string[]) => {

  if (!decoded || !decoded.role || !allowedRoles.includes(decoded.role)) {

    return false;
  }
  return true;
};
