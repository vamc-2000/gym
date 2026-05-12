import { NextRequest, NextResponse } from "next/server";
import { r2Service } from "@/lib/r2";
import { authMiddleware } from "@/middlewares/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const decoded = authMiddleware(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ success: false, error: "Missing fileName or contentType" }, { status: 400 });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `community/${timestamp}-${random}-${cleanFileName}`;

    // Generate Presigned URL using unified service
    const signedUrl = await r2Service.getPresignedUploadUrl(key, contentType);
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      success: true,
      data: {
        signedUrl,
        publicUrl,
        key,
      }
    });
  } catch (error: any) {
    console.error("Presigned URL Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
