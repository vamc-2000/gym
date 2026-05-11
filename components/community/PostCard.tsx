"use client";

import { useState, memo, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  Flame, MessageSquare, Share2, Bookmark, 
  MoreHorizontal, CheckCircle2, Zap, Clock, Activity 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { communityService, Post } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";

const CommentItem = memo(({ comment }: { comment: any }) => {
  const [avatarError, setAvatarError] = useState(false);
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.name || 'G'}`;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex-shrink-0 overflow-hidden">
        <Image 
          src={avatarError ? fallbackAvatar : (comment.user?.avatar || fallbackAvatar)} 
          alt="U" 
          width={40} 
          height={40}
          onError={() => setAvatarError(true)}
        />
      </div>
      <div className="bg-white/2 p-4 rounded-2xl border border-white/5 flex-1 group">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">{comment.user?.name || "Anonymous"}</span>
          <span className="text-[8px] font-black text-dash-text-dim uppercase tracking-widest opacity-30">
            {mounted ? formatDistanceToNow(new Date(comment.createdAt)) : "..."}
          </span>
        </div>
        <p className="text-xs text-dash-text font-medium leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
});

CommentItem.displayName = "CommentItem";

export default function PostCard({ post, currentUserId, onDelete }: { post: Post, currentUserId: string, onDelete: () => void }) {
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(post.likes?.length > 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Mock stats for visual richness as requested
  const stats = {
    calories: Math.floor(Math.random() * 500) + 200,
    duration: "45 MIN",
    type: "STRENGTH"
  };

  const handleLike = useCallback(async () => {
    try {
      const res = await communityService.likePost(post.id, isLiked);
      if (res.success) {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (e) {}
  }, [post.id, isLiked]);

  const toggleComments = useCallback(async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await communityService.getComments(post.id);
      if (res.success) setComments(res.data || []);
    } finally {
      setLoadingComments(false);
    }
  }, [showComments, post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await communityService.addComment(post.id, commentText);
      if (res.success) {
        setCommentText("");
        setComments(prev => [res.data, ...prev]);
        triggerToast("Update", "Comment synchronized", "success");
      }
    } catch (e) {}
  };

  const [userAvatarError, setUserAvatarError] = useState(false);
  const userFallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.name || 'G'}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 rounded-2xl border border-cyan-400/20 overflow-hidden backdrop-blur-md relative"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full border border-neon-blue/30 overflow-hidden bg-dash-card">
              <Image 
                src={userAvatarError ? userFallbackAvatar : (post.user?.avatar || userFallbackAvatar)} 
                alt="Avatar" 
                width={40} 
                height={40} 
                className="object-cover" 
                onError={() => setUserAvatarError(true)}
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-neon-blue rounded-full p-0.5 border border-dash-bg">
              <CheckCircle2 className="w-2.5 h-2.5 text-dash-bg" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-[11px] font-black text-white uppercase tracking-tight truncate">{post.user?.name || "Athlete"}</h4>
              <span className="text-[7px] font-black bg-neon-blue/10 text-neon-blue px-1.5 py-0.5 rounded border border-neon-blue/20">PRO</span>
            </div>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">
              {mounted ? `${formatDistanceToNow(new Date(post.createdAt))} ago` : "Initializing..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {post.userId === currentUserId && (
            <button 
              onClick={async () => {
                if (confirm("De-synchronize this transmission?")) {
                  const res = await communityService.deletePost(post.id);
                  if (res.success) {
                    triggerToast("Success", "Post purged", "success");
                    onDelete();
                  }
                }
              }}
              className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button className="w-8 h-8 rounded-lg hover:bg-white/5 text-white/20 flex items-center justify-center transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap font-medium mb-4">
          {post.content.split(/(\s+)/).map((part, i) => (
            part.startsWith("#") 
              ? <span key={i} className="text-neon-blue font-black cursor-pointer hover:underline decoration-neon-blue/40 underline-offset-4 transition-all">{part} </span> 
              : part
          ))}
        </p>

        {/* Workout Stats */}
        <div className="flex gap-2 mb-4">
           {[
             { icon: Zap, label: "Burn", val: `${stats.calories} kcal`, color: "text-neon-blue" },
             { icon: Clock, label: "Time", val: stats.duration, color: "text-purple-500" },
             { icon: Activity, label: "Type", val: stats.type, color: "text-neon-yellow" }
           ].map((s, i) => (
             <div key={i} className="flex-1 bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2 group/stat hover:bg-white/10 transition-all">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <div className="min-w-0">
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-widest truncate">{s.label}</p>
                  <p className="text-[9px] font-black text-white truncate">{s.val}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Media */}
      {post.mediaUrl && !mediaError && (
        <div className="relative aspect-[16/9] mx-4 rounded-2xl overflow-hidden border border-white/10 mb-4 shadow-xl group/media">
          {post.mediaType === "video" ? (
            <video 
              src={post.mediaUrl} 
              controls 
              className="w-full h-full object-cover"
              onError={() => setMediaError(true)}
            />
          ) : (
            <Image
              src={post.mediaUrl}
              alt="Post Media"
              fill
              className="object-cover group-hover/media:scale-105 transition-all duration-[1000ms]"
              onError={() => setMediaError(true)}
              sizes="(max-width: 768px) 100vw, 800px"
              priority={false}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/5 bg-white/2">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${isLiked ? "text-neon-blue" : "text-white/40 hover:text-white"}`}
          >
            <Flame className={`w-4 h-4 ${isLiked ? "fill-neon-blue animate-bounce" : ""}`} />
            <span>{likes} PULSE</span>
          </button>
          <button 
            onClick={toggleComments}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post._count.comments} INTEL</span>
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
              triggerToast("Success", "Relay link encrypted and copied", "success");
            }}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={() => {
            setIsSaved(!isSaved);
            triggerToast(isSaved ? "Purged" : "Stored", isSaved ? "Intel removed from vault" : "Intel secured in vault", "success");
          }}
          className={`transition-colors cursor-pointer ${isSaved ? "text-neon-blue" : "text-white/20 hover:text-neon-blue"}`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-neon-blue" : ""}`} />
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-4 bg-black/20 border-t border-white/5 space-y-4"
          >
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Synchronize intel..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-neon-blue/30 transition-all font-medium"
              />
              <button className="px-6 py-3 bg-neon-blue text-dash-bg font-black rounded-xl text-[9px] uppercase tracking-widest shadow-lg shadow-neon-blue/20 cursor-pointer">Post</button>
            </form>

            <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {loadingComments ? (
                <div className="flex justify-center p-8">
                  <div className="w-6 h-6 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  {comments.length === 0 && <p className="text-center text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] opacity-30 italic">No historical data records.</p>}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
