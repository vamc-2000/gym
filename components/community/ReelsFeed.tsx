"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Loader2, Play } from "lucide-react";
import ReelPlayer from "./ReelPlayer";

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

interface ReelsFeedProps {
  reels: ReelItem[];
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (id: string) => void;
  onShare: (reel: ReelItem) => void;
  onOpenComments: (reelId: string) => void;
  onMenuOpen: (reel: ReelItem) => void;
}

export default function ReelsFeed({
  reels,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
  onLike,
  onShare,
  onOpenComments,
  onMenuOpen,
}: ReelsFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Scroll handler to monitor snapping active index and fetch-more thresholds
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, clientHeight, scrollHeight } = container;

    // 1. Calculate active index
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex && index >= 0 && index < reels.length) {
      startTransition(() => {
        setActiveIndex(index);
      });
    }

    // 2. Infinite scroll trigger when remaining scroll space is < 1.5 reels
    const remainingScrollSpace = scrollHeight - scrollTop - clientHeight;
    if (remainingScrollSpace < clientHeight * 1.5 && hasMore && !loading) {
      onLoadMore();
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col justify-center items-center bg-black">
      {reels.length === 0 && !loading ? (
        <div className="text-center p-8 opacity-40">
          <Play className="w-12 h-12 text-neon-blue mx-auto mb-4 animate-pulse" />
          <p className="text-xs font-black text-white uppercase tracking-widest">No active reels</p>
        </div>
      ) : (
        /* GPU Accelerated Snapping Container */
        <div
          ref={feedContainerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {reels.map((reel, index) => {
            const isActive = activeIndex === index;
            // Virtualized mounting: only mount video nodes within +/- 1 range of the active reel index
            const isPreload = Math.abs(activeIndex - index) <= 1;

            return (
              <div
                key={reel.id}
                className="w-full h-full snap-start snap-always relative overflow-hidden flex items-center justify-center bg-black"
                style={{ height: "100%" }}
              >
                <ReelPlayer
                  reel={reel}
                  isActive={isActive}
                  isPreload={isPreload}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onShare={onShare}
                  onOpenComments={onOpenComments}
                  onMenuOpen={onMenuOpen}
                  globalMuted={globalMuted}
                  setGlobalMuted={setGlobalMuted}
                />
              </div>
            );
          })}

          {/* Loading spinner for infinite scroll */}
          {loading && (
            <div className="w-full h-[150px] flex items-center justify-center bg-black py-8 snap-start">
              <Loader2 className="w-6 h-6 text-neon-blue animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
