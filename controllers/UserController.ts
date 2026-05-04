import { NextRequest, NextResponse } from "next/server";
import { userService } from "../services/UserService";
import { authMiddleware } from "../middlewares/auth";

export class UserController {
  async getProfile(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const profile = await userService.getProfile(decoded.userId);
      return NextResponse.json({ success: true, data: profile });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async updateProfile(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      
      // 1. Map Fitness Level
      if (body.fitnessLevel) {
        const inputLevel = body.fitnessLevel.toLowerCase();
        const validLevels = ["beginner", "intermediate", "advanced"];
        if (validLevels.includes(inputLevel)) {
          body.fitnessLevel = inputLevel.charAt(0).toUpperCase() + inputLevel.slice(1);
        }
      }

      // 2. Map Diet Preference
      const dietInput = (body.dietPreference || body.dietaryPreference || "").toUpperCase();
      if (dietInput) {
        if (dietInput === "VEG" || dietInput === "VEGETARIAN") {
          body.dietPreference = "VEG";
        } else if (dietInput === "NON_VEG" || dietInput === "NON-VEG" || dietInput === "NON-VEGETARIAN") {
          body.dietPreference = "NON_VEG";
        } else if (dietInput === "BOTH") {
          body.dietPreference = "BOTH";
        }
      }

      const updated = await userService.updateProfile(decoded.userId, body);
      if (!updated) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }


  async updateGoal(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      const { goal } = await req.json();
      if (!goal) throw new Error("Goal is required");

      const updated = await userService.updateProfile(decoded.userId, { goal });
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async updateDietPreference(req: NextRequest) {
    const decoded = authMiddleware(req);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
      const { dietPreference } = await req.json();
      if (!dietPreference) throw new Error("Diet preference is required");

      const updated = await userService.updateProfile(decoded.userId, { dietPreference });
      return NextResponse.json({ success: true, data: updated });
    } catch (error: unknown) {
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const userController = new UserController();
