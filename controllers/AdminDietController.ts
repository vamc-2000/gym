import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middlewares/auth";

export class AdminDietController {
  private validateDietPlan(meals: unknown) {
    const mealsTyped = meals as { schedule?: Record<string, unknown> };
    if (!mealsTyped || !mealsTyped.schedule) return { valid: false, message: "Diet plan must have a schedule." };
    
    // Example validation: must have breakfast, lunch, and dinner
    const requiredMeals = ["breakfast", "lunch", "dinner"];
    const scheduleKeys = Object.keys(mealsTyped.schedule);
    
    const missing = requiredMeals.filter(m => !scheduleKeys.includes(m));
    if (missing.length > 0) {
      return { valid: false, message: `Missing required meals: ${missing.join(", ")}` };
    }

    return { valid: true };
  }

  async createTemplate(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      
      if (body.isActive) {
        const validation = this.validateDietPlan(body.meals);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      const template = await prisma.dietTemplate.create({
        data: {
          goal: body.goal,
          level: body.level,
          planName: body.planName,
          description: body.description,
          dietType: body.dietType || "BOTH",
          calorieTarget: body.calorieTarget,
          proteinPerKg: body.proteinPerKg,
          meals: body.meals,
          minBMI: body.minBMI,
          maxBMI: body.maxBMI,
          isActive: body.isActive || false,
          version: 1
        }
      });
      return NextResponse.json({ success: true, data: template });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
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
        const validation = this.validateDietPlan(body.meals);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
      }

      const existing = await prisma.dietTemplate.findUnique({ where: { id } });
      if (!existing) throw new Error("Template not found");

      const template = await prisma.dietTemplate.update({
        where: { id },
        data: {
          goal: body.goal,
          level: body.level,
          planName: body.planName,
          description: body.description,
          dietType: body.dietType,
          calorieTarget: body.calorieTarget,
          proteinPerKg: body.proteinPerKg,
          meals: body.meals,
          minBMI: body.minBMI,
          maxBMI: body.maxBMI,
          isActive: body.isActive,
          version: existing.version + 1
        }
      });
      return NextResponse.json({ success: true, data: template });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }

  async deleteTemplate(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded || decoded.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      if (!id) throw new Error("Template ID required");

      await prisma.dietTemplate.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Template deleted" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  }
}

export const adminDietController = new AdminDietController();
