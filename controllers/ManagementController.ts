import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "../repositories/UserRepository";
import { authMiddleware, checkRole } from "../middlewares/auth";

export class ManagementController {
  // List all users (Admin & SuperAdmin)
  async listUsers(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!checkRole(decoded, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden: Higher role required" }, { status: 403 });
    }

    try {
      const users = await userRepository.findAll(); // We'll add this to the repository
      return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  // Update user role (SuperAdmin only)
  async updateRole(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!checkRole(decoded, ["SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    try {
      const { userId, newRole } = await req.json();
      if (!["ADMIN", "USER"].includes(newRole)) {
        throw new Error("Invalid role selection");
      }

      const updated = await userRepository.update(userId, { role: newRole });
      return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  // Delete user (SuperAdmin only)
  async deleteUser(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!checkRole(decoded, ["SUPER_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    try {
      const { userId } = await req.json();
      await userRepository.delete(userId); // We'll add this to the repository
      return NextResponse.json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const managementController = new ManagementController();
