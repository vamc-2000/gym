import { NextRequest } from "next/server";
import { userPlanController } from "@/controllers/UserPlanController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return userPlanController.getPlan(req);
}
