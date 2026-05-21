import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reelId = searchParams.get("id");
    const fallbackUrl = searchParams.get("url");

    let videoUrl = fallbackUrl;

    if (reelId) {
      await connectDB();
      const reel = await prisma.reel.findUnique({
        where: { id: reelId },
        select: { optimizedVideoUrl: true, videoUrl: true }
      });
      if (reel) {
        videoUrl = reel.optimizedVideoUrl || reel.videoUrl;
      }
    }

    if (!videoUrl) {
      return NextResponse.json({ error: "Missing video source telemetry parameter" }, { status: 400 });
    }

    const rangeHeader = req.headers.get("range");
    
    // Set headers for proxying
    const headers: Record<string, string> = {
      "Accept-Ranges": "bytes",
    };

    if (rangeHeader) {
      headers["Range"] = rangeHeader;
    }

    // Call Cloudflare R2
    const response = await fetch(videoUrl, {
      headers,
      cache: "no-store",
    });

    const isPartial = response.status === 206 || rangeHeader;
    const responseStatus = isPartial ? 206 : 200;

    const proxyHeaders = new Headers();
    proxyHeaders.set("Content-Type", response.headers.get("content-type") || "video/mp4");
    proxyHeaders.set("Accept-Ranges", "bytes");
    
    if (response.headers.get("content-range")) {
      proxyHeaders.set("Content-Range", response.headers.get("content-range")!);
    }
    if (response.headers.get("content-length")) {
      proxyHeaders.set("Content-Length", response.headers.get("content-length")!);
    }
    proxyHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(response.body, {
      status: responseStatus,
      headers: proxyHeaders,
    });
  } catch (error: any) {
    console.error("Stream Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
