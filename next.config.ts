import type { NextConfig } from "next";

// Silence aborted connection and ECONNRESET errors during dev hot-reloads
if (process.env.NODE_ENV === "development") {
  const handleAbortError = (err: any) => {
    if (err && (err.code === "ECONNRESET" || err.message === "aborted" || err.message?.includes("aborted"))) {
      return true;
    }
    return false;
  };

  process.on("uncaughtException", (err: any) => {
    if (handleAbortError(err)) return;
    console.error("Uncaught Exception:", err);
  });

  process.on("unhandledRejection", (reason: any) => {
    if (handleAbortError(reason)) return;
    console.error("Unhandled Rejection:", reason);
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-17b1ea0d4fbc45e399261e27c2f1da16.r2.dev",
      },
      {
        protocol: "https",
        hostname: "cdn.gymstreak.com",
      },

      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

};

export default nextConfig;
