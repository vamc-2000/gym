import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "fallback_refresh_secret";

export const generateAccessToken = (user: any) => {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign({ userId: user.id, role: user.role }, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string, role?: string };
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
  } catch (err) {
    return null;
  }
};
