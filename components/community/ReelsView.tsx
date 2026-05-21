"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, Play, Loader2, Pencil, Trash2, Save, X, Send } from "lucide-react";
import { apiClient } from "@/lib/api";
import { communityService } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";
import { tokenManager } from "@/lib/auth";
import DeleteConfirmModal from "@/components/community/DeleteConfirmModal";
import ReelsFeed from "./ReelsFeed";
import VideoUploadModal from "./VideoUploadModal";

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

export default function ReelsView() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  // Edit & Delete state
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [activeMenuReel, setActiveMenuReel] = useState<ReelItem | null>(null);

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>("/reels?limit=10");
      if (res.success && res.data) {
        setReels(res.data.reels);
        setNextCursor(res.data.nextCursor);
        setHasMore(!!res.data.nextCursor);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreReels = async () => {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await apiClient<any>(`/reels?limit=10&cursor=${nextCursor}`);
      if (res.success && res.data) {
        setReels(prev => [...prev, ...res.data.reels]);
        setNextCursor(res.data.nextCursor);
        setHasMore(!!res.data.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReels();
    const user = tokenManager.getUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  const handleLike = async (id: string) => {
    // Optimistic UI update
    setReels(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            isLiked: !r.isLiked,
            likesCount: r.isLiked ? r.likesCount - 1 : r.likesCount + 1,
          };
        }
        return r;
      })
    );

    try {
      await apiClient(`/reels/${id}/like`, { method: "POST" });
    } catch (e) {
      // rollback on error
      fetchReels();
    }
  };

  const handleShare = (reel: ReelItem) => {
    if (navigator.share) {
      navigator.share({
        title: "GymStreak Reel",
        text: `${reel.user.name}: "${reel.caption}"`,
        url: window.location.origin + `/dashboard/community?tab=Reels&reelId=${reel.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/dashboard/community?tab=Reels&reelId=${reel.id}`);
      triggerToast("Shared", "Reel telemetry link copied to clipboard", "success");
    }
  };

  const openComments = async (reelId: string) => {
    setShowComments(reelId);
    setComments([]);
    try {
      const res = await apiClient<any>(`/reels/${reelId}/comments`);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (e) {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !showComments) return;
    setSubmittingComment(true);

    try {
      const res = await apiClient<any>(`/reels/${showComments}/comments`, {
        method: "POST",
        body: { content: commentText },
      });
      if (res.success && res.data) {
        setComments(prev => [res.data, ...prev]);
        setCommentText("");
        setReels(prev =>
          prev.map(r => {
            if (r.id === showComments) {
              return { ...r, commentsCount: r.commentsCount + 1 };
            }
            return r;
          })
        );
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUploadSuccess = (newReel: any) => {
    setReels(prev => [newReel, ...prev]);
    setShowUpload(false);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto h-[78vh] bg-black rounded-[3rem] border border-white/5 overflow-hidden flex flex-col justify-center">
      {/* Upload trigger button */}
      <button
        onClick={() => setShowUpload(true)}
        className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-black/60 border border-white/10 hover:border-neon-blue flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer animate-pulse"
      >
        <UploadCloud className="w-4 h-4 text-neon-blue" />
      </button>

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            Buffering Transmissions
          </span>
        </div>
      ) : reels.length === 0 ? (
        <div className="text-center p-8 opacity-40">
          <Play className="w-12 h-12 text-neon-blue mx-auto mb-4 animate-pulse" />
          <p className="text-xs font-black text-white uppercase tracking-widest">No active reels</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-6 px-6 py-3 bg-neon-blue text-dash-bg font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all cursor-pointer"
          >
            Upload First Reel
          </button>
        </div>
      ) : (
        <ReelsFeed
          reels={reels}
          currentUserId={currentUserId}
          loading={loadingMore}
          hasMore={hasMore}
          onLoadMore={fetchMoreReels}
          onLike={handleLike}
          onShare={handleShare}
          onOpenComments={openComments}
          onMenuOpen={(reel) => {
            setActiveMenuReel(reel);
          }}
        />
      )}

      {/* Upload Modal Overlay */}
      <AnimatePresence>
        {showUpload && (
          <VideoUploadModal
            onClose={() => setShowUpload(false)}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      {/* Sliding comments drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#08080c] border-t border-white/10 rounded-t-[2rem] z-40 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Telemetry Comments</h3>
              <button
                onClick={() => setShowComments(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="p-3 bg-white/2 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black text-neon-blue uppercase">{c.user.name}</span>
                    <span className="text-[7px] text-white/20 uppercase font-black">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 leading-relaxed">{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-[8px] font-black text-white/20 text-center uppercase py-8">
                  No comment signals yet
                </p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-3 border-t border-white/5 pt-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Transmitting comment node..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white placeholder-white/20 focus:border-neon-blue outline-none transition-all"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="w-10 h-10 rounded-xl bg-neon-blue text-dash-bg flex items-center justify-center hover:scale-105 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Owner Menu Dropdown Drawer */}
      <AnimatePresence>
        {activeMenuReel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 bg-[#08080c] border-t border-white/10 rounded-t-[2rem] z-[45] p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Reel Action Protocol</span>
              <button
                onClick={() => setActiveMenuReel(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => {
                setEditingReel(activeMenuReel);
                setEditCaption(activeMenuReel.caption);
                setActiveMenuReel(null);
              }}
              className="w-full py-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-neon-blue hover:bg-white/5 transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" /> Edit Caption
            </button>
            
            <button
              onClick={() => {
                setDeletingReelId(activeMenuReel.id);
                setActiveMenuReel(null);
              }}
              className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Purge Reel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Reel Caption Modal */}
      <AnimatePresence>
        {editingReel && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute inset-0 bg-black/95 z-50 p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Edit Reel Caption</h3>
              <button
                onClick={() => setEditingReel(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="Update reel caption..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/20 focus:border-neon-blue outline-none transition-all resize-none font-medium"
              />

              <button
                onClick={async () => {
                  if (!editCaption.trim()) return;
                  setSavingEdit(true);
                  try {
                    const res = await communityService.editReel(editingReel.id, { caption: editCaption.trim() });
                    if (res.success) {
                      setReels(prev =>
                        prev.map(r => (r.id === editingReel.id ? { ...r, caption: editCaption.trim() } : r))
                      );
                      triggerToast("Synchronized", "Reel caption updated", "success");
                      setEditingReel(null);
                    } else {
                      triggerToast("Error", res.error || "Failed to update", "error");
                    }
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                disabled={savingEdit}
                className="w-full max-w-xs py-3.5 bg-neon-blue text-dash-bg font-black text-[10px] uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Reel Confirmation Modal */}
      <AnimatePresence>
        {deletingReelId && (
          <DeleteConfirmModal
            title="Delete Reel"
            message="This will permanently remove the reel, all its likes, and comments. This cannot be undone."
            onConfirm={async () => {
              try {
                const res = await communityService.deleteReel(deletingReelId);
                if (res.success) {
                  setReels(prev => prev.filter(r => r.id !== deletingReelId));
                  triggerToast("Success", "Reel purged from the grid", "success");
                } else {
                  triggerToast("Error", res.error || "Failed to delete", "error");
                }
              } catch (err: any) {
                triggerToast("Error", err.message, "error");
              } finally {
                setDeletingReelId(null);
              }
            }}
            onClose={() => setDeletingReelId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
