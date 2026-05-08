"use client";

import { useState } from "react";
import { communityService, Post } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post, currentUserId, onDelete }: { post: Post, currentUserId: string, onDelete: () => void }) {
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(post.likes?.length > 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    try {
      const res = await communityService.likePost(post.id, isLiked);
      if (res.success) {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (e) {}
  };

  const fetchComments = async () => {
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
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await communityService.addComment(post.id, commentText);
      if (res.success) {
        setCommentText("");
        setComments(prev => [res.data, ...prev]);
        triggerToast("Success", "Comment added", "success");
      }
    } catch (e) {}
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await communityService.deletePost(post.id);
      if (res.success) {
        triggerToast("Deleted", "Post removed", "success");
        onDelete();
      }
    } catch (e) {}
  };

  const [mediaError, setMediaError] = useState(false);

  return (
    <div className="bg-dash-card border border-dash-border-subtle rounded-2xl overflow-hidden mb-6 shadow-lg">
      <div className="p-4 flex items-center justify-between border-b border-dash-border-subtle/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20 text-neon-blue font-bold">
            {post.user?.name?.[0] || "U"}
          </div>
          <div>
            <h4 className="text-sm font-bold text-dash-text">{post.user?.name || "User"}</h4>
            <span className="text-[10px] text-dash-text-dim">
              {formatDistanceToNow(new Date(post.createdAt))} ago • {post.privacy === "public" ? "🌎 Public" : "🔒 Friends"}
            </span>
          </div>
        </div>
        {post.userId === currentUserId && (
          <button onClick={handleDelete} className="p-2 text-dash-text-dim hover:text-red-500 transition-colors">🗑️</button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-dash-text leading-relaxed whitespace-pre-wrap">{post.content}</p>
        
        {post.mediaUrl && !mediaError && (
          <div className="relative group">
            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full max-h-[420px] object-cover rounded-xl border border-neon-blue/10 hover:border-neon-blue/30 transition-all shadow-[0_0_20px_rgba(0,245,255,0.05)]"
                onError={() => setMediaError(true)}
              />
            ) : post.mediaType === "video" ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[420px] rounded-xl border border-neon-blue/10"
                onError={() => setMediaError(true)}
              />
            ) : null}
          </div>
        )}

        {mediaError && (
          <div className="w-full h-32 bg-dash-bg/50 rounded-xl border border-dashed border-dash-border-subtle flex flex-col items-center justify-center gap-2">
            <span className="text-2xl opacity-40">🖼️</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-dash-text-dim">Media failed to load</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center gap-6 border-t border-dash-border-subtle/30 bg-dash-bg/30">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 text-xs font-bold transition-all ${isLiked ? "text-neon-blue" : "text-dash-text-dim hover:text-dash-text"}`}
        >
          <span>{isLiked ? "❤️" : "🤍"}</span>
          <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
        </button>
        <button 
          onClick={fetchComments}
          className="flex items-center gap-2 text-xs font-bold text-dash-text-dim hover:text-dash-text transition-all"
        >
          <span>💬</span>
          <span>{post._count.comments} {post._count.comments === 1 ? "Comment" : "Comments"}</span>
        </button>
      </div>

      {showComments && (
        <div className="p-4 bg-dash-bg/50 border-t border-dash-border-subtle/50 space-y-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-dash-card border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text outline-none focus:border-neon-blue"
            />
            <button className="px-4 py-2 bg-neon-blue text-dash-bg font-black rounded-lg text-[10px] uppercase">Post</button>
          </form>

          {loadingComments ? (
            <div className="flex justify-center p-4">
              <div className="w-5 h-5 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-dash-card border border-dash-border-subtle flex-shrink-0 flex items-center justify-center text-xs font-bold text-neon-blue">
                    {comment.user?.name?.[0] || "U"}
                  </div>
                  <div className="bg-dash-card p-3 rounded-xl border border-dash-border-subtle flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-neon-blue">{comment.user?.name || "User"}</span>
                      <span className="text-[8px] text-dash-text-dim">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                    </div>
                    <p className="text-xs text-dash-text">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-[10px] text-dash-text-dim italic">No comments yet. Be the first!</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
