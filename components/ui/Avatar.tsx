"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string; // Tailwind layout classes (e.g. "w-10 h-10 rounded-full border border-neon-blue/30 overflow-hidden bg-dash-card")
  fallbackSizeClass?: string; // Font size styling (e.g. "text-xs font-black uppercase")
}

const colors = [
  "bg-gradient-to-br from-neon-blue to-purple-600 text-white shadow-[0_0_15px_rgba(0,245,255,0.2)]",
  "bg-gradient-to-br from-purple-600 to-rose-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]",
  "bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]",
  "bg-gradient-to-br from-pink-500 to-purple-700 text-white shadow-[0_0_15px_rgba(236,72,153,0.2)]",
  "bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-[0_0_15px_rgba(234,179,8,0.2)]",
];

function getAvatarColor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

export default function Avatar({ src, name = "U", className = "w-10 h-10 rounded-full border border-neon-blue/30 overflow-hidden bg-dash-card", fallbackSizeClass = "text-xs font-black uppercase" }: AvatarProps) {
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset error when src changes (e.g. when a new avatar is uploaded)
  useEffect(() => {
    setError(false);
  }, [src]);

  // Clean name / first letter
  const displayName = name && name.trim() ? name.trim() : "U";
  const displayLetter = displayName.charAt(0).toUpperCase();

  const colorClass = getAvatarColor(displayName);

  // If client-side has not mounted yet, render standard structure to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className={`${className} flex items-center justify-center shrink-0`}>
        <div className="w-full h-full bg-[#12121a] animate-pulse" />
      </div>
    );
  }

  // If there is an avatar URL and no error has occurred, render it
  if (src && src.trim() !== "" && !error) {
    // Append timestamp to bust R2 caching issues
    const finalSrc = src.includes("?") ? `${src}&v=${Date.now()}` : `${src}?v=${Date.now()}`;
    return (
      <div className={`${className} flex items-center justify-center shrink-0 relative`}>
        <Image
          src={finalSrc} // NextJS optimization pattern (remotePatterns already configured)
          alt={displayName}
          fill
          sizes="(max-width: 768px) 100vw, 80px"
          className="object-cover w-full h-full"
          onError={() => setError(true)}
          unoptimized // Prevents caching on NextJS server
        />
      </div>
    );
  }

  // Otherwise, render a high-quality letter circle
  return (
    <div className={`${className} flex items-center justify-center shrink-0`}>
      <div className={`w-full h-full flex items-center justify-center ${colorClass} ${fallbackSizeClass}`}>
        {displayLetter}
      </div>
    </div>
  );
}
