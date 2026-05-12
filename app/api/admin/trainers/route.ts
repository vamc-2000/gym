import { NextRequest } from "next/server";
import { trainerController } from "@/controllers/TrainerController";

export async function GET(req: NextRequest) {
  return trainerController.getAllTrainers(req);
}

export async function POST(req: NextRequest) {
  return trainerController.createTrainer(req);
}

export async function DELETE(req: NextRequest) {
  return trainerController.deleteTrainer(req);
}
