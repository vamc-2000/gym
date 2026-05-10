"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { communityService, Post } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";
import { formatDistanceToNow } from "date-fns";

const CommentItem = memo(({ comment }: { comment: any }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex-shrink-0 flex items-center justify-center text-xs font-black text-neon-blue">
      {comment.user?.name?.[0] || "U"}
    </div>
    <div className="bg-white/2 p-4 rounded-2xl border border-white/5 flex-1 group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">{comment.user?.name || "Anonymous"}</span>
        <span className="text-[8px] font-black text-dash-text-dim uppercase tracking-widest opacity-30">{formatDistanceToNow(new Date(comment.createdAt))}</span>
      </div>
      <p className="text-xs text-dash-text font-medium leading-relaxed">{comment.content}</p>
    </div>
  </div>
));

CommentItem.displayName = "CommentItem";

export default function PostCard({ post, currentUserId, onDelete }: { post: Post, currentUserId: string, onDelete: () => void }) {
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(post.likes?.length > 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [mediaError, setMediaError] = useState(false);

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
        triggerToast("Update", "Comment added to sequence", "success");
      }
    } catch (e) {}
  };

  const handleDelete = async () => {
    if (!confirm("Terminate this transmission?")) return;
    try {
      const res = await communityService.deletePost(post.id);
      if (res.success) {
        triggerToast("Cleanup", "Transmission terminated", "success");
        onDelete();
      }
    } catch (e) {}
  };

  return (
    <div className="bg-dash-card border border-white/5 rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl backdrop-blur-xl group hover:border-white/10 transition-all">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1rem] bg-neon-blue/5 flex items-center justify-center border border-neon-blue/10 text-neon-blue font-black text-xl">
            {post.user?.name?.[0] || "U"}
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{post.user?.name || "User"}</h4>
            <div className="flex items-center gap-3 mt-1.5">
               <span className="text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] opacity-40">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </span>
              <span className="text-[8px] font-black text-neon-blue uppercase tracking-widest opacity-60">
                {post.privacy === "public" ? "Global Link" : "Secure Node"}
              </span>
            </div>
          </div>
        </div>
        {post.userId === currentUserId && (
          <button onClick={handleDelete} className="w-10 h-10 rounded-xl hover:bg-red-500/10 text-dash-text-dim hover:text-red-500 transition-all flex items-center justify-center cursor-pointer">🗑️</button>
        )}
      </div>

      <div className="p-8 space-y-8">
        <p className="text-sm text-dash-text leading-relaxed whitespace-pre-wrap font-medium">{post.content}</p>
        
        {post.mediaUrl && !mediaError && (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/5 aspect-video">
            {post.mediaType === "image" ? (
              <Image
                src={post.mediaUrl}
                alt="Media"
                fill
                className="object-cover hover:scale-105 transition-all duration-700"
                onError={() => setMediaError(true)}
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : post.mediaType === "video" ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[500px]"
                onError={() => setMediaError(true)}
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="px-8 py-6 flex items-center gap-8 border-t border-white/5 bg-white/2">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isLiked ? "text-neon-blue" : "text-dash-text-dim hover:text-white"}`}
        >
          <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
          <span>{likes} Reactions</span>
        </button>
        <button 
          onClick={toggleComments}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-dash-text-dim hover:text-white transition-all cursor-pointer"
        >
          <span className="text-lg">💬</span>
          <span>{post._count.comments} Intel</span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-8 bg-black/20 border-t border-white/5 space-y-8"
          >
            <form onSubmit={handleAddComment} className="flex gap-4">
              <input 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Submit Intel..."
                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-xs text-white outline-none focus:border-neon-blue/30 transition-all font-medium"
              />
              <button className="px-6 py-3 bg-neon-blue text-dash-bg font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-neon-blue/10 cursor-pointer">Post</button>
            </form>

            {loadingComments ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
                {comments.length === 0 && <p className="text-center text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] opacity-30 italic">No historical intel available.</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

