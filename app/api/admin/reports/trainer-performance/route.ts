import { NextRequest, NextResponse } from "next/server";
import { roleMiddleware, PERMISSIONS } from "@/middlewares/roleMiddleware";
import { trainerRepository } from "@/repositories/TrainerRepository";

export async function GET(req: NextRequest) {
  const decoded = roleMiddleware(req, PERMISSIONS.ADMIN_ACCESS);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const report = await trainerRepository.getDetailedTrainerReport();
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
