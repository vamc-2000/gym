import { NextRequest } from "next/server";
import { notificationController } from "@/controllers/NotificationController";
import { connectDB } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const awaitedParams = await params;
  // We can pass the ID in the body or params. The controller expects notificationId from body currently.
  // Let's adapt the controller or use body.
  return notificationController.markAsRead(req);
}
