import { NextRequest } from "next/server";
import { friendshipController } from "@/controllers/FriendshipController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return friendshipController.getPendingRequests(req);
}
