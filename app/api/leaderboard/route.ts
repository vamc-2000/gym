import { NextRequest } from "next/server";
import { leaderboardController } from "@/controllers/LeaderboardController";
import { connectDB } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  return leaderboardController.getLeaderboard(req);
}
