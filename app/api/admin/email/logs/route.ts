import { NextRequest } from "next/server";
import { emailController } from "@/controllers/emailController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return emailController.getLogs(req);
}
