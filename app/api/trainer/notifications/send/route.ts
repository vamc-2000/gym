import { NextRequest } from "next/server";
import { trainerController } from "@/controllers/TrainerController";

export async function POST(req: NextRequest) {
  return trainerController.sendNotifications(req);
}
