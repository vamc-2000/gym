import { NextRequest } from "next/server";
import { adminExerciseController } from "@/controllers/AdminExerciseController";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();
  return adminExerciseController.getAllExercises(req);
}

export async function POST(req: NextRequest) {
  await connectDB();
  return adminExerciseController.createExercise(req);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  return adminExerciseController.updateExercise(req);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  return adminExerciseController.deleteExercise(req);
}
