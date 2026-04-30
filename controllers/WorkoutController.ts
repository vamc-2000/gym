import { NextRequest, NextResponse } from "next/server";
import { workoutService } from "../services/WorkoutService";
import { authMiddleware } from "../middlewares/auth";
import { userRepository } from "../repositories/UserRepository";

export class WorkoutController {
  async getWorkoutPlan(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const user = await userRepository.findById(decoded.userId);
      if (!user) throw new Error("User not found");
      
      const goal = user.goal || "Weight Loss";
      const fitnessLevel = user.fitnessLevel || "Beginner";
      const plan = await workoutService.getWorkoutPlan(user.id, goal, fitnessLevel);
      return NextResponse.json({ success: true, data: plan });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async startWorkout(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { workoutId } = await req.json();
      const log = await workoutService.startWorkout(decoded.userId, workoutId);
      return NextResponse.json({ success: true, data: log });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async completeWorkout(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { workoutId } = await req.json();
      const log = await workoutService.completeWorkout(decoded.userId, workoutId);
      return NextResponse.json({ success: true, data: log });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const workoutController = new WorkoutController();
