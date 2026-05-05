import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/AuthService";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { email } = await req.json();
    if (!email) throw new Error("Email is required");
    
    await authService.sendOTP(email);
    return NextResponse.json({ success: true, message: "OTP sent to your email" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
