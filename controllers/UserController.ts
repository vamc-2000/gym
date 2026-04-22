import { NextRequest, NextResponse } from "next/server";
import { userService } from "../services/UserService";
import { authMiddleware } from "../middlewares/auth";

export class UserController {
  async getProfile(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const profile = await userService.getProfile(userId);
      return NextResponse.json({ success: true, data: profile });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async updateProfile(req: NextRequest) {
    const userId = authMiddleware(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const updated = await userService.updateProfile(userId, body);
      return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const userController = new UserController();
