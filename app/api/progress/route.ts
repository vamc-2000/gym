import { NextRequest } from "next/server";
import { progressController } from "@/controllers/ProgressController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return progressController.getStreak(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return progressController.updateProgress(req);
}