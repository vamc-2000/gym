import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@/lib/prisma";
import { connectDB } from "@/lib/db";
import { r2Service } from "@/lib/r2";
import { videoOptimizer } from "@/lib/videoOptimizer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const dynamic = 'force-dynamic';

const TEMP_DIR = path.join(process.cwd(), "tmp", "reels-upload");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  const decoded = authMiddleware(req);
  if (!decoded) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Direct (non-chunked) Upload Mode
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const caption = (formData.get("caption") as string) || "PR Workout Transmission";

      if (!file) {
        return NextResponse.json({ success: false, error: "No video file provided" }, { status: 400 });
      }

      // Check max size: 100MB
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "File exceeds 100MB size limit" }, { status: 400 });
      }

      const uploadId = uuidv4();
      const userTempDir = path.join(TEMP_DIR, uploadId);
      fs.mkdirSync(userTempDir, { recursive: true });

      const inputPath = path.join(userTempDir, `source_${file.name}`);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

      // Optimize video (FFmpeg with local copy fallback)
      const optimizationResults = await videoOptimizer.optimizeVideo(
        inputPath,
        userTempDir,
        uploadId
      );

      // Upload files to Cloudflare R2
      const originalBuffer = fs.readFileSync(inputPath);
      const originalR2Key = `reels/${uploadId}_original.mp4`;
      const originalUrl = await r2Service.uploadFile(originalBuffer, originalR2Key, file.type);

      let optimizedUrl = originalUrl;
      let thumbnailUrl = "";

      if (optimizationResults.optimizedPath && fs.existsSync(optimizationResults.optimizedPath)) {
        const optBuffer = fs.readFileSync(optimizationResults.optimizedPath);
        const optR2Key = `reels/${uploadId}_optimized.mp4`;
        optimizedUrl = await r2Service.uploadFile(optBuffer, optR2Key, "video/mp4");
      }

      if (optimizationResults.thumbnailPath && fs.existsSync(optimizationResults.thumbnailPath)) {
        const thumbBuffer = fs.readFileSync(optimizationResults.thumbnailPath);
        const thumbR2Key = `reels/${uploadId}_thumb.jpg`;
        thumbnailUrl = await r2Service.uploadFile(thumbBuffer, thumbR2Key, "image/jpeg");
      }

      // Create Reel in database
      const newReel = await prisma.reel.create({
        data: {
          userId: decoded.userId,
          caption,
          videoUrl: originalUrl,
          optimizedVideoUrl: optimizedUrl,
          thumbnailUrl,
          videoDuration: optimizationResults.duration,
          videoWidth: optimizationResults.width,
          videoHeight: optimizationResults.height,
          compressionStatus: "COMPLETED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      // Log MediaUpload
      await prisma.mediaUpload.create({
        data: {
          userId: decoded.userId,
          url: originalUrl,
          optimizedVideoUrl: optimizedUrl,
          thumbnailUrl,
          videoDuration: optimizationResults.duration,
          videoWidth: optimizationResults.width,
          videoHeight: optimizationResults.height,
          compressionStatus: "COMPLETED",
          type: "video",
          key: originalR2Key,
        }
      });

      // Cleanup local temp directory
      fs.rmSync(userTempDir, { recursive: true, force: true });

      return NextResponse.json({ success: true, data: newReel });
    }

    // JSON action mode (Chunked Upload Protocol)
    const body = await req.json();
    const { action } = body;

    if (action === "init") {
      const { filename, totalChunks, fileSize } = body;
      if (!filename || !totalChunks || !fileSize) {
        return NextResponse.json({ success: false, error: "Missing transmission init headers" }, { status: 400 });
      }

      const uploadId = uuidv4();
      const uploadPath = path.join(TEMP_DIR, uploadId);
      fs.mkdirSync(uploadPath, { recursive: true });

      // Save metadata
      fs.writeFileSync(
        path.join(uploadPath, "meta.json"),
        JSON.stringify({ filename, totalChunks, fileSize, uploadedChunks: [] })
      );

      return NextResponse.json({
        success: true,
        data: { uploadId, chunkDirectory: uploadId }
      });
    }

    if (action === "chunk") {
      const { uploadId, chunkIndex, chunkData } = body; // chunkData is base64 encoded
      if (!uploadId || chunkIndex === undefined || !chunkData) {
        return NextResponse.json({ success: false, error: "Missing chunk telemetry payload" }, { status: 400 });
      }

      const uploadPath = path.join(TEMP_DIR, uploadId);
      if (!fs.existsSync(uploadPath)) {
        return NextResponse.json({ success: false, error: "Upload session expired or invalid" }, { status: 404 });
      }

      const chunkPath = path.join(uploadPath, `chunk_${chunkIndex}`);
      fs.writeFileSync(chunkPath, Buffer.from(chunkData, "base64"));

      // Update metadata
      const metaPath = path.join(uploadPath, "meta.json");
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        if (!meta.uploadedChunks.includes(chunkIndex)) {
          meta.uploadedChunks.push(chunkIndex);
          fs.writeFileSync(metaPath, JSON.stringify(meta));
        }
      }

      return NextResponse.json({ success: true, data: { chunkIndex } });
    }

    if (action === "complete") {
      const { uploadId, caption } = body;
      if (!uploadId) {
        return NextResponse.json({ success: false, error: "Missing session identifier" }, { status: 400 });
      }

      const uploadPath = path.join(TEMP_DIR, uploadId);
      if (!fs.existsSync(uploadPath)) {
        return NextResponse.json({ success: false, error: "Upload session invalid" }, { status: 404 });
      }

      const meta = JSON.parse(fs.readFileSync(path.join(uploadPath, "meta.json"), "utf8"));
      const finalInputPath = path.join(uploadPath, `source_${meta.filename}`);
      
      const writeStream = fs.createWriteStream(finalInputPath);

      for (let i = 0; i < meta.totalChunks; i++) {
        const chunkPath = path.join(uploadPath, `chunk_${i}`);
        if (!fs.existsSync(chunkPath)) {
          writeStream.end();
          return NextResponse.json({
            success: false,
            error: `Chunk mismatch: missing chunk #${i}. Please retry chunk upload.`
          }, { status: 400 });
        }
        const buffer = fs.readFileSync(chunkPath);
        writeStream.write(buffer);
      }
      writeStream.end();

      // Wait a moment for stream closure
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Run optimization pipeline
      const optimizationResults = await videoOptimizer.optimizeVideo(
        finalInputPath,
        uploadPath,
        uploadId
      );

      // Upload to R2
      const originalBuffer = fs.readFileSync(finalInputPath);
      const originalR2Key = `reels/${uploadId}_original.mp4`;
      const originalUrl = await r2Service.uploadFile(originalBuffer, originalR2Key, "video/mp4");

      let optimizedUrl = originalUrl;
      let thumbnailUrl = "";

      if (optimizationResults.optimizedPath && fs.existsSync(optimizationResults.optimizedPath)) {
        const optBuffer = fs.readFileSync(optimizationResults.optimizedPath);
        const optR2Key = `reels/${uploadId}_optimized.mp4`;
        optimizedUrl = await r2Service.uploadFile(optBuffer, optR2Key, "video/mp4");
      }

      if (optimizationResults.thumbnailPath && fs.existsSync(optimizationResults.thumbnailPath)) {
        const thumbBuffer = fs.readFileSync(optimizationResults.thumbnailPath);
        const thumbR2Key = `reels/${uploadId}_thumb.jpg`;
        thumbnailUrl = await r2Service.uploadFile(thumbBuffer, thumbR2Key, "image/jpeg");
      }

      // Create model entry
      const newReel = await prisma.reel.create({
        data: {
          userId: decoded.userId,
          caption: caption || "PR Workout deployment",
          videoUrl: originalUrl,
          optimizedVideoUrl: optimizedUrl,
          thumbnailUrl,
          videoDuration: optimizationResults.duration,
          videoWidth: optimizationResults.width,
          videoHeight: optimizationResults.height,
          compressionStatus: "COMPLETED",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      // Log MediaUpload
      await prisma.mediaUpload.create({
        data: {
          userId: decoded.userId,
          url: originalUrl,
          optimizedVideoUrl: optimizedUrl,
          thumbnailUrl,
          videoDuration: optimizationResults.duration,
          videoWidth: optimizationResults.width,
          videoHeight: optimizationResults.height,
          compressionStatus: "COMPLETED",
          type: "video",
          key: originalR2Key,
        }
      });

      // Cleanup
      fs.rmSync(uploadPath, { recursive: true, force: true });

      return NextResponse.json({ success: true, data: newReel });
    }

    return NextResponse.json({ success: false, error: "Action parameter not specified" }, { status: 400 });
  } catch (error: any) {
    console.error("Reel processing error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
