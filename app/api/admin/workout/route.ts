import { NextRequest } from "next/server";
import { adminWorkoutController } from "@/controllers/AdminWorkoutController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return adminWorkoutController.createTemplate(req);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  return adminWorkoutController.updateTemplate(req);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  return adminWorkoutController.deleteTemplate(req);
}
