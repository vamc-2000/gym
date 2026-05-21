"use client";

import { Heart, MessageCircle, Share2, MoreVertical, Eye, Trash2 } from "lucide-react";

interface ReelItem {
  id: string;
  caption: string;
  videoUrl: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  user: {
    id: string;
    name: string;
  };
}

interface ReelControlsProps {
  reel: ReelItem;
  currentUserId: string;
  onLike: (id: string) => void;
  onShare: (reel: ReelItem) => void;
  onOpenComments: (reelId: string) => void;
  onMenuOpen: (reel: ReelItem) => void;
}

export default function ReelControls({
  reel,
  currentUserId,
  onLike,
  onShare,
  onOpenComments,
  onMenuOpen,
}: ReelControlsProps) {
  return (
    <>
      {/* Owner Options (3-Dot menu) */}
      {reel.user.id === currentUserId && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(reel);
            }}
            className="w-10 h-10 rounded-full bg-black/55 border border-white/10 hover:border-neon-blue flex items-center justify-center text-white/70 hover:text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Action Center */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-20">
        {/* Like Node */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(reel.id);
          }}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/45 border backdrop-blur-md group-hover:scale-110 active:scale-90 transition-all ${
              reel.isLiked
                ? "text-red-500 border-red-500/20 bg-red-500/10"
                : "text-white/80 border-white/10"
            }`}
          >
            <Heart className="w-5 h-5" fill={reel.isLiked ? "currentColor" : "none"} />
          </div>
          <span className="text-[10px] font-black text-white mt-1.5 drop-shadow-md">
            {reel.likesCount}
          </span>
        </button>

        {/* Comment Node */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(reel.id);
          }}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/45 border border-white/10 backdrop-blur-md group-hover:scale-110 active:scale-90 transition-all text-white/80">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-white mt-1.5 drop-shadow-md">
            {reel.commentsCount}
          </span>
        </button>

        {/* Share Node */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(reel);
          }}
          className="flex flex-col items-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/45 border border-white/10 backdrop-blur-md group-hover:scale-110 active:scale-90 transition-all text-white/80">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1.5 drop-shadow-md">
            Share
          </span>
        </button>

        {/* Delete Node (Owner Only) */}
        {reel.user.id === currentUserId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(reel); // Reusing the same delete action logic from the menu
            }}
            className="flex flex-col items-center group cursor-pointer mt-2"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 border border-red-500/20 backdrop-blur-md group-hover:scale-110 active:scale-90 transition-all text-red-500">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-black text-red-500/60 uppercase tracking-widest mt-1.5 drop-shadow-md">
              Delete
            </span>
          </button>
        )}
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="absolute left-6 bottom-8 right-20 z-20 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-black text-white uppercase tracking-tight pointer-events-auto">
            @{reel.user.name}
          </p>
          <div className="flex items-center gap-1 bg-black/45 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
            <Eye className="w-2.5 h-2.5 text-neon-blue" />
            <span className="text-[7px] font-black text-white/70 uppercase">
              {reel.viewsCount || 0}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-white/85 leading-relaxed max-w-sm line-clamp-2 pointer-events-auto">
          {reel.caption}
        </p>
      </div>

      {/* Dark overlay backdrop to increase readability of bottom text */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-10" />
    </>
  );
}
