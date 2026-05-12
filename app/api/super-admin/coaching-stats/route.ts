import { NextRequest } from "next/server";
import { superAdminController } from "@/controllers/SuperAdminController";

export async function GET(req: NextRequest) {
  return await superAdminController.getGlobalCoachingStats(req);
}
