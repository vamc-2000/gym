import { NextRequest } from "next/server";
import { userController } from "@/controllers/UserController";
import { connectDB } from "@/lib/db";

export async function PUT(req: NextRequest) {
  await connectDB();
  return userController.updateProfile(req);
}

export async function GET(req: NextRequest) {
  await connectDB();
  return userController.getProfile(req);
}
