import { NextRequest } from "next/server";
import { scheduleController } from "@/controllers/ScheduleController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return scheduleController.getDailySchedule(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return scheduleController.createCustomItem(req);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  return scheduleController.completeItem(req);
}
