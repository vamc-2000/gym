import { NextRequest, NextResponse } from "next/server";
import { tokenManager } from "@/lib/auth";
import { r2Service } from "@/lib/r2";
import { verifyAccessToken } from "@/utils/jwt";

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyAccessToken(token || "");
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileName } = await req.json();
    if (!fileName) throw new Error("File name is required");

    // Security: Ensure the user can only delete their own files
    if (!fileName.startsWith(`${decoded.userId}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await r2Service.deleteFile(fileName);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
