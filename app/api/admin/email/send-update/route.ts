import { NextRequest } from "next/server";
import { emailController } from "@/controllers/emailController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return emailController.sendUpdate(req);
}
