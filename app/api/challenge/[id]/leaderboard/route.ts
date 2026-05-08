import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { trainerRepository } from "@/repositories/TrainerRepository";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const decoded = authMiddleware(req);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const awaitedParams = await params;
  try {
    const leaderboard = await trainerRepository.getChallengeLeaderboard(awaitedParams.id);
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
