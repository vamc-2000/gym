import { NextRequest } from "next/server";
import { notificationController } from "@/controllers/NotificationController";
import { connectDB } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  await connectDB();
  // The controller expects notificationId from body currently.
  return notificationController.markAsRead(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return notificationController.markAllAsRead(req);
}
