import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/AuthService";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { email, otp, password } = await req.json();
    if (!email || !otp || !password) throw new Error("Email, OTP and new password are required");
    
    await authService.resetPassword(email, otp, password);
    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
