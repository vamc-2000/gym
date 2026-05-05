import { NextRequest } from "next/server";
import { workoutHistoryController } from "@/controllers/WorkoutHistoryController";

export async function GET(req: NextRequest) {
  return workoutHistoryController.getHistory(req);
}
