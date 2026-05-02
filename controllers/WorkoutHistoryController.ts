import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { workoutService } from "../services/WorkoutService";

export class WorkoutHistoryController {
  async getHistory(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const history = await workoutService.getWorkoutHistory(decoded.userId);
      return NextResponse.json({ success: true, data: history });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const workoutHistoryController = new WorkoutHistoryController();
