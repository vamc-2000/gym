import { NextRequest, NextResponse } from "next/server";
import { dietService } from "../services/DietService";
import { authMiddleware } from "../middlewares/auth";

export class DietController {
  async getDietPlan(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const plan = await dietService.getDietPlan(decoded.userId);
      return NextResponse.json({ success: true, data: plan });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async getAllOptions(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const options = await dietService.getAllDietOptions(decoded.userId);
      return NextResponse.json({ success: true, data: options });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const dietController = new DietController();
