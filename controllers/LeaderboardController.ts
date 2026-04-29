import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "../services/LeaderboardService";
import { authMiddleware } from "../middlewares/auth";

export class LeaderboardController {
  async getLeaderboard(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const topUsers = await leaderboardService.getLeaderboard(50);
      const userRank = await leaderboardService.getUserRank(decoded.userId);
      
      return NextResponse.json({ 
        success: true, 
        data: {
          leaderboard: topUsers,
          currentUser: userRank
        } 
      });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const leaderboardController = new LeaderboardController();
