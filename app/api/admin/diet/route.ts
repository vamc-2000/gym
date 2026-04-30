import { NextRequest } from "next/server";
import { adminDietController } from "@/controllers/AdminDietController";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  return adminDietController.createTemplate(req);
}

export async function PUT(req: NextRequest) {
  await connectDB();
  return adminDietController.updateTemplate(req);
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  return adminDietController.deleteTemplate(req);
}
