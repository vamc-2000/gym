"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Heart, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import ReelControls from "./ReelControls";

interface ReelItem {
  id: string;
  caption: string;
  videoUrl: string;
  optimizedVideoUrl?: string;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  user: {
    id: string;
    name: string;
  };
}

interface ReelPlayerProps {
  reel: ReelItem;
  isActive: boolean;
  isPreload: boolean;
  currentUserId: string;
  onLike: (id: string) => void;
  onShare: (reel: ReelItem) => void;
  onOpenComments: (reelId: string) => void;
  onMenuOpen: (reel: ReelItem) => void;
  globalMuted: boolean;
  setGlobalMuted: (muted: boolean) => void;
}

export default function ReelPlayer({
  reel,
  isActive,
  isPreload,
  currentUserId,
  onLike,
  onShare,
  onOpenComments,
  onMenuOpen,
  globalMuted,
  setGlobalMuted,
}: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState<"play" | "pause" | null>(null);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
  const [viewLogged, setViewLogged] = useState(false);

  // Use the optimized streaming proxy
  const videoSource = `/api/reels/stream?id=${reel.id}`;

  // Log view when active for > 2 seconds
  useEffect(() => {
    if (isActive && !viewLogged) {
      const timer = setTimeout(async () => {
        try {
          await apiClient("/reels/view", {
            method: "POST",
            body: { reelId: reel.id, viewDuration: 2.0 },
            requiresAuth: false
          });
          setViewLogged(true);
        } catch (e) {
          console.error("View logger telemetry failed:", e);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, viewLogged, reel.id]);

  // Handle active state play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      setIsBuffering(true);
      video.muted = globalMuted;
      video.play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          console.warn("Autoplay block protection:", err);
          setIsPlaying(false);
          setIsBuffering(false);
        });
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive, globalMuted]);

  // Handle global mute change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = globalMuted;
    }
  }, [globalMuted]);

  // Monitor buffering and time progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const duration = video.duration || 1;
    setProgress((current / duration) * 100);

    // Calculate buffer progress
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBufferProgress((bufferedEnd / duration) * 100);
    }
  };

  const handleWaiting = () => setIsBuffering(true);
  const handlePlaying = () => {
    setIsBuffering(false);
    setIsPlaying(true);
  };

  // Double tap to like
  let lastTap = 0;
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      // Double tap triggered
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        setHeartPos({ x, y });
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
      }
      if (!reel.isLiked) {
        onLike(reel.id);
      }
    } else {
      // Single tap -> toggle play/pause
      togglePlayPause();
    }
    lastTap = now;
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setShowPlayPauseIcon("pause");
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
      setShowPlayPauseIcon("play");
    }

    setTimeout(() => setShowPlayPauseIcon(null), 600);
  };

  // Long press handling
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handlePressStart = () => {
    pressTimerRef.current = setTimeout(() => {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsLongPressed(true);
      }
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    if (isLongPressed) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      setIsLongPressed(false);
    }
  };


  return (
    <div
      ref={containerRef}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className="w-full h-full relative flex items-center justify-center bg-[#050508] overflow-hidden select-none"
    >
      {/* Blurred background to prevent black bars for non-9:16 formats */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
        {isActive ? (
          <video
            src={videoSource}
            className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={reel.thumbnailUrl || "/api/placeholder/1080/1920"}
            alt="Telemetry Blur Background"
            className="w-full h-full object-cover blur-2xl scale-110 opacity-60 transition-all"
          />
        )}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      </div>

      {/* Video Element */}
      {(isActive || isPreload) && (
        <video
          ref={videoRef}
          src={videoSource}
          poster={reel.thumbnailUrl}
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          className={`w-full h-full transition-all duration-500 z-10 relative object-contain ${
            isLongPressed ? "scale-[0.98] brightness-75" : ""
          }`}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
        />
      )}

      {/* Click / Tap Overlay covering the video zone for robust click handling */}
      <div
        onClick={handleTap}
        className="absolute inset-0 w-full h-full z-10 cursor-pointer"
      />

      {/* Placeholder Image / Poster if not preloaded */}
      {(!isActive && !isPreload) && (
        <img
          src={reel.thumbnailUrl || "/api/placeholder/1080/1920"}
          alt="Reel preview"
          className="w-full h-full object-cover brightness-50 z-0"
        />
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] pointer-events-none z-10">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
        </div>
      )}

      {/* Double Tap Like Heart Animation */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1], y: -40 }}
            exit={{ scale: 1.5, opacity: 0, y: -100 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: heartPos.x - 40,
              top: heartPos.y - 40,
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Tap Play/Pause Icon Pop-up */}
      <AnimatePresence>
        {showPlayPauseIcon && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute z-20 w-16 h-16 rounded-full bg-black/60 flex items-center justify-center text-white pointer-events-none"
          >
            {showPlayPauseIcon === "play" ? (
              <Play className="w-8 h-8 text-neon-blue fill-neon-blue ml-1" />
            ) : (
              <Pause className="w-8 h-8 text-white fill-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volume Overlay Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setGlobalMuted(!globalMuted);
        }}
        className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/55 border border-white/10 hover:border-neon-blue flex items-center justify-center text-white/90 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
      >
        {globalMuted ? (
          <VolumeX className="w-4 h-4 text-white/60 animate-pulse" />
        ) : (
          <Volume2 className="w-4 h-4 text-neon-blue" />
        )}
      </button>

      {/* Controls Overlay */}
      <ReelControls
        reel={reel}
        currentUserId={currentUserId}
        onLike={onLike}
        onShare={onShare}
        onOpenComments={onOpenComments}
        onMenuOpen={onMenuOpen}
      />

      {/* Progress Bars (Buffer & Played progress) */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 z-20">
        {/* Buffering bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/15 transition-all duration-300"
          style={{ width: `${bufferProgress}%` }}
        />
        {/* Play progress bar */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-neon-blue to-purple-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Long Press Visual Indicator */}
      {isLongPressed && (
        <div className="absolute top-6 right-20 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md text-[8px] font-black uppercase text-neon-yellow tracking-widest pointer-events-none z-20 animate-pulse">
          Telemetry Suspended
        </div>
      )}
    </div>
  );
}
