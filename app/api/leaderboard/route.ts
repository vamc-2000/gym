import { NextRequest } from "next/server";
import { socialController } from "@/controllers/SocialController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return socialController.getLeaderboard(req);
}
