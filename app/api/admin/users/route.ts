import { NextRequest } from "next/server";
import { managementController } from "../../../../controllers/ManagementController";

export async function GET(req: NextRequest) {
  return await managementController.listUsers(req);
}

export async function PUT(req: NextRequest) {
  return await managementController.updateRole(req);
}

export async function DELETE(req: NextRequest) {
  return await managementController.deleteUser(req);
}
