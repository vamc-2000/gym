import { NextRequest } from "next/server";
import { workoutController } from "@/controllers/WorkoutController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return workoutController.getWorkoutPlan(req);
}
