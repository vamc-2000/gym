import { NextRequest, NextResponse } from "next/server";
import { workoutService } from "../services/WorkoutService";
import { authMiddleware } from "../middlewares/auth";
import { userRepository } from "../repositories/UserRepository";

export class WorkoutController {
  async getWorkoutPlan(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const user = await userRepository.findById(userId);
      if (!user) throw new Error("User not found");
      
      const plan = await workoutService.getWorkoutPlan(user.goal, user.fitnessLevel);
      return NextResponse.json({ success: true, data: plan });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async completeWorkout(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { workoutId } = await req.json();
      const log = await workoutService.completeWorkout(userId, workoutId);
      return NextResponse.json({ success: true, data: log });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const workoutController = new WorkoutController();
