import { NextRequest, NextResponse } from "next/server";
import { authEmailService } from "../services/authEmailService";

export class PasswordResetController {
  async initiate(req: NextRequest) {
    try {
      const { email } = await req.json();
      if (!email) throw new Error("Email is required");

      await authEmailService.initiateForgotPassword(email);
      return NextResponse.json({ success: true, message: "OTP sent to your email" });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async verify(req: NextRequest) {
    try {
      const { email, otp } = await req.json();
      if (!email || !otp) throw new Error("Email and OTP are required");

      const token = await authEmailService.verifyOTP(email, otp);
      return NextResponse.json({ success: true, data: { token } });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  async reset(req: NextRequest) {
    try {
      const { email, token, newPassword } = await req.json();
      if (!email || !token || !newPassword) throw new Error("Missing required fields");

      await authEmailService.resetPassword(email, token, newPassword);
      return NextResponse.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }
}

export const passwordResetController = new PasswordResetController();
