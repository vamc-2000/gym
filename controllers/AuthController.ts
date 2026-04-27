import { NextRequest, NextResponse } from "next/server";
import { authService } from "../services/AuthService";

export class AuthController {
  async register(req: NextRequest) {
    try {
      const body = await req.json();
      const user = await authService.register(body);
      return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: unknown) {
      console.error("Registration Error:", error);
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }

  async login(req: NextRequest) {
    try {
      const { email, password } = await req.json();
      const result = await authService.login(email, password);
      return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
      console.error("Login Error:", error);
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 401 });
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
      return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
      console.error("Verify OTP Error:", error);
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : String(error)) }, { status: 400 });
    }
  }
}

export const authController = new AuthController();
