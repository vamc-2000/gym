import { NextRequest } from "next/server";
import { friendController } from "@/controllers/FriendController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return friendController.getSuggestions(req);
}
