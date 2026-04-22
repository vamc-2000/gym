import { NextRequest } from "next/server";
import { authController } from "@/controllers/AuthController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return authController.login(req);
}
