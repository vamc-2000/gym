import { NextRequest } from "next/server";
import { managementController } from "../../../../controllers/ManagementController";

export async function GET(req: NextRequest) {
  return await managementController.getStats(req);
}
