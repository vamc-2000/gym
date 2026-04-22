import { NextRequest, NextResponse } from "next/server";
import { dietService } from "../services/DietService";
import { authMiddleware } from "../middlewares/auth";

export class DietController {
  async getDietPlan(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const plan = await dietService.getDietPlan(userId);
      return NextResponse.json({ success: true, data: plan });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const dietController = new DietController();
