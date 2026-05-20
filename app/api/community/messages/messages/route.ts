import { NextRequest } from "next/server";
import { chatController } from "@/controllers/ChatController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return chatController.getMessages(req);
}
