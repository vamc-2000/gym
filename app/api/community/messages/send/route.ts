import { NextRequest } from "next/server";
import { chatController } from "@/controllers/ChatController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return chatController.sendMessage(req);
}
