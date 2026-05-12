import { NextRequest } from "next/server";
import { friendshipController } from "@/controllers/FriendshipController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return friendshipController.sendRequest(req);
}
