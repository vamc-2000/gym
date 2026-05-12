import { NextRequest, NextResponse } from "next/server";
import { tokenManager } from "@/lib/auth";
import { r2Service } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";
import { verifyAccessToken } from "@/utils/jwt";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyAccessToken(token || "");
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `${decoded.userId}/${uuidv4()}.${fileExt}`;
    
    const fileUrl = await r2Service.uploadFile(buffer, fileName, file.type);

    return NextResponse.json({ success: true, url: fileUrl, fileName });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyAccessToken(token || "");
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileName } = await req.json();
    if (!fileName) throw new Error("File name is required");

    if (!fileName.startsWith(`${decoded.userId}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await r2Service.deleteFile(fileName);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
