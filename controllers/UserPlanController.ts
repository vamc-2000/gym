import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middlewares/auth";
import { workoutService } from "../services/WorkoutService";
import { PlanGenerationService } from "../services/PlanGenerationService";
import { prisma } from "../lib/prisma";

export class UserPlanController {
  async getPlan(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const planData = await workoutService.getWorkoutPlan(decoded.userId);

      if (!planData) {
        return NextResponse.json({ success: false, error: "Plan not found and no goal set." }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: planData });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async generatePlan(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) throw new Error("User not found");

      const plan = await PlanGenerationService.generateAndSavePlan(decoded.userId, {
        goal: user.goal || "General Fitness",
        fitnessLevel: user.fitnessLevel || "Beginner",
        height: user.height || 170,
        weight: user.weight || 70,
        targetWeight: user.targetWeight || 65
      });

      return NextResponse.json({ success: true, data: plan });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const userPlanController = new UserPlanController();
