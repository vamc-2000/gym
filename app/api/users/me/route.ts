import { NextRequest } from "next/server";
import { userController } from "@/controllers/UserController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return userController.getProfile(req);
}
