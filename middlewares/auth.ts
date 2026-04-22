import { NextRequest } from "next/server";
import { verifyAccessToken } from "../utils/jwt";

export const authMiddleware = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);
  return decoded ? decoded.userId : null;
};
