import { NextRequest } from "next/server";
import { progressController } from "@/controllers/ProgressController";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  return progressController.getProgress(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return progressController.updateProgress(req);
}