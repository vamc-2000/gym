import { NextRequest, NextResponse } from "next/server";
import { authService } from "../services/AuthService";

export class AuthController {
  async register(req: NextRequest) {
    try {
      const body = await req.json();
      const result = await authService.register(body);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error: unknown) {
      console.error("Registration Error:", error);
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
      }

      const result = await authService.login(email, password);
      return NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user
        }
      });
    } catch (error: unknown) {
      console.error("LOGIN_ERROR:", error);
      return NextResponse.json({ 
        success: false, 
        error: (error instanceof Error ? error.message : "Internal Server Error") 
      }, { status: 401 });
    }
  }

  async sendOTP(req: NextRequest) {
    try {
      const { email } = await req.json();
      await authService.sendOTP(email);
      return NextResponse.json({ success: true, message: "OTP sent" });
    } catch (error: unknown) {
      console.error("Send OTP Error:", error);
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async verifyOTP(req: NextRequest) {
    try {
      const { email, otp } = await req.json();
      const result = await authService.verifyOTP(email, otp);
      return NextResponse.json({ success: true, data: result });
    } catch (error: unknown) {
      console.error("Verify OTP Error:", error);
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const authController = new AuthController();
