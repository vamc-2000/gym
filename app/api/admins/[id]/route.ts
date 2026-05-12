import { NextRequest } from "next/server";
import { superAdminController } from "@/controllers/SuperAdminController";
import { connectDB } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  return superAdminController.updateAdmin(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  return superAdminController.deleteAdmin(req, { params });
}

// For status update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  // We'll reuse updateAdmin or create a specific status update method if needed
  return superAdminController.updateAdmin(req, { params });
}

