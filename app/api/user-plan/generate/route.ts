import { NextRequest } from "next/server";
import { userPlanController } from "@/controllers/UserPlanController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return userPlanController.generatePlan(req);
}
