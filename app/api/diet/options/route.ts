import { NextRequest } from "next/server";
import { dietController } from "@/controllers/DietController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return dietController.getAllOptions(req);
}
