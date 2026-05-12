import { NextRequest } from "next/server";
import { trainerController } from "@/controllers/TrainerController";

export async function GET(req: NextRequest) {
  return trainerController.getDashboard(req);
}

export async function POST(req: NextRequest) {
  return trainerController.addNote(req);
}
