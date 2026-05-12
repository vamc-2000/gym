import { NextRequest } from "next/server";
import { trainerController } from "@/controllers/TrainerController";

export async function GET(req: NextRequest) {
  return trainerController.getLiveMonitoring(req);
}
