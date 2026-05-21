import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  optimizedPath?: string;
  thumbnailPath?: string;
}

export const videoOptimizer = {
  /**
   * Checks if FFmpeg is installed and available in the system PATH.
   */
  async isFfmpegAvailable(): Promise<boolean> {
    try {
      await execPromise("ffmpeg -version");
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Extracts metadata (duration, dimensions) from a video file.
   */
  async getMetadata(filePath: string): Promise<{ duration: number; width: number; height: number }> {
    const fallback = { duration: 10.0, width: 1080, height: 1920 };
    const hasFfmpeg = await this.isFfmpegAvailable();
    if (!hasFfmpeg) {
      return fallback;
    }

    try {
      const { stdout } = await execPromise(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of default=noprint_wrappers=1 ${filePath}`
      );
      
      const widthMatch = stdout.match(/width=(\d+)/);
      const heightMatch = stdout.match(/height=(\d+)/);
      const durationMatch = stdout.match(/duration=([\d.]+)/);

      return {
        width: widthMatch ? parseInt(widthMatch[1]) : fallback.width,
        height: heightMatch ? parseInt(heightMatch[1]) : fallback.height,
        duration: durationMatch ? parseFloat(durationMatch[1]) : fallback.duration,
      };
    } catch (error) {
      console.warn("ffprobe error, using fallback metadata:", error);
      return fallback;
    }
  },

  /**
   * Optimizes a video for mobile/web vertical reels:
   * - Resizes to 1080x1920 vertical format.
   * - Compresses using H.264 + AAC.
   * - Configures faststart for instant streaming.
   */
  async optimizeVideo(
    inputPath: string,
    outputDirectory: string,
    fileNamePrefix: string
  ): Promise<VideoMetadata> {
    const hasFfmpeg = await this.isFfmpegAvailable();
    const metadata = await this.getMetadata(inputPath);
    
    const optimizedFileName = `${fileNamePrefix}_optimized.mp4`;
    const thumbnailFileName = `${fileNamePrefix}_thumb.jpg`;
    
    const optimizedPath = path.join(outputDirectory, optimizedFileName);
    const thumbnailPath = path.join(outputDirectory, thumbnailFileName);

    if (!hasFfmpeg) {
      console.warn("⚠️ FFmpeg is not installed on this system. Running fallback copy mechanism.");
      // Fallback: Copy original video as optimized, write a mock thumbnail
      fs.copyFileSync(inputPath, optimizedPath);
      
      // Create a 1x1 black dummy JPEG file for the thumbnail fallback
      const dummyJpgBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
      fs.writeFileSync(thumbnailPath, Buffer.from(dummyJpgBase64, "base64"));

      return {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        optimizedPath,
        thumbnailPath,
      };
    }

    try {
      // 1. Convert video to 1080x1920 H.264 MP4 optimized for fast start streaming
      // vf filters: scale to vertical format and pad if necessary to maintain aspects
      const videoFilter = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2`;
      const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -vf "${videoFilter}" -c:v libx264 -crf 24 -preset fast -movflags +faststart -c:a aac -b:a 128k "${optimizedPath}"`;
      
      console.log("Optimizing video with command:", ffmpegCmd);
      await execPromise(ffmpegCmd);

      // 2. Extract a high quality thumbnail from the 1.0 second mark
      const thumbCmd = `ffmpeg -y -ss 00:00:01 -i "${inputPath}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
      console.log("Extracting thumbnail with command:", thumbCmd);
      await execPromise(thumbCmd);

      // 3. Return output details
      return {
        duration: metadata.duration,
        width: 1080,
        height: 1920,
        optimizedPath,
        thumbnailPath,
      };
    } catch (error) {
      console.error("FFmpeg processing failure, falling back to copy:", error);
      
      // Safely cleanup potential partial files
      if (fs.existsSync(optimizedPath)) fs.unlinkSync(optimizedPath);
      if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

      fs.copyFileSync(inputPath, optimizedPath);
      const dummyJpgBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
      fs.writeFileSync(thumbnailPath, Buffer.from(dummyJpgBase64, "base64"));

      return {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        optimizedPath,
        thumbnailPath,
      };
    }
  }
};
