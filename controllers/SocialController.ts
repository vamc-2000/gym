import { NextRequest, NextResponse } from "next/server";
import { socialService } from "../services/SocialService";

export class SocialController {
  async getLeaderboard(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category") || "Overall";
      const leaderboard = await socialService.getLeaderboard(category);
      return NextResponse.json({ success: true, data: leaderboard });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const socialController = new SocialController();
