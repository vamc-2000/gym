import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth";

export class AdminWorkoutController {
  private validateExerciseCount(level: string, exercises: any) {
    let counts: number[] = [];
    
    // Parse through weeks and days to find the max/min exercises per day
    if (exercises?.weeks) {
      exercises.weeks.forEach((week: any) => {
        week.days.forEach((day: any) => {
          if (day.routine && Array.isArray(day.routine)) {
            // Only count if it's not a rest day
            if (day.type !== "Complete Rest" && day.type !== "LISS Cardio") {
              counts.push(day.routine.length);
            }
          }
        });
      });
    }

    if (counts.length === 0) return { valid: true }; // No routines defined yet

    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);

    let requiredMin = 0;
    let requiredMax = 0;

    switch (level.toLowerCase()) {
      case "beginner":
        requiredMin = 5;
        requiredMax = 6;
        break;
      case "intermediate":
        requiredMin = 8;
        requiredMax = 10;
        break;
      case "advanced":
        requiredMin = 12;
        requiredMax = 12; // Assuming exactly 12 or at least 12
        break;
    }

    if (maxCount > requiredMax || minCount < requiredMin) {
      return { 
        valid: false, 
        message: `Invalid exercise count for level ${level}. Found range: ${minCount}-${maxCount}. Required: ${requiredMin}-${requiredMax}.` 
      };
    }

    return { valid: true };
  }

  async createTemplate(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      
      if (body.isActive) {
        const validation = this.validateExerciseCount(body.level, body.exercises);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      const template = await prisma.workoutTemplate.create({
        data: {
          title: body.title,
          goal: body.goal,
          level: body.level,
          exercises: body.exercises,
          isActive: body.isActive || false,
          version: 1
        }
      });
      return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async updateTemplate(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) throw new Error("Template ID required");

      const body = await req.json();

      if (body.isActive) {
        const validation = this.validateExerciseCount(body.level || "Beginner", body.exercises);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      // Versioning: instead of replacing, we could create a new version, or just bump version
      const existing = await prisma.workoutTemplate.findUnique({ where: { id } });
      if (!existing) throw new Error("Template not found");

      const template = await prisma.workoutTemplate.update({
        where: { id },
        data: {
          title: body.title,
          goal: body.goal,
          level: body.level,
          exercises: body.exercises,
          isActive: body.isActive,
          version: existing.version + 1
        }
      });
      return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async deleteTemplate(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) throw new Error("Template ID required");

      await prisma.workoutTemplate.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Template deleted" });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const adminWorkoutController = new AdminWorkoutController();
