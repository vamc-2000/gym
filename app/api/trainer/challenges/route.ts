import { NextRequest } from "next/server";
import { trainerController } from "@/controllers/TrainerController";

export async function GET(req: NextRequest) {
  return trainerController.getChallenges(req);
}

export async function POST(req: NextRequest) {
  return trainerController.createChallenge(req);
}
