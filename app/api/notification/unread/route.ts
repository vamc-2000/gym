import { NextRequest } from "next/server";
import { notificationController } from "@/controllers/NotificationController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return notificationController.getUnreadCount(req);
}
