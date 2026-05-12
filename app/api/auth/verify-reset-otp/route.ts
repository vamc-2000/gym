import { NextRequest } from "next/server";
import { passwordResetController } from "@/controllers/passwordResetController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return passwordResetController.verify(req);
}
