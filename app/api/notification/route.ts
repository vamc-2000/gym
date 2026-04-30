import { NextRequest } from "next/server";
import { notificationController } from "@/controllers/NotificationController";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  return notificationController.getNotifications(req);
}
