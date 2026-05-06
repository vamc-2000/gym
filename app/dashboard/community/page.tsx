"use client";

import { useEffect, useState } from "react";
import { communityService, Post } from "@/services/communityService";
import CreatePost from "@/components/community/CreatePost";
import PostCard from "@/components/community/PostCard";
import { tokenManager } from "@/lib/auth";

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await communityService.getFeed();
      if (res.success) setPosts(res.data || []);
      
      const user = tokenManager.getUser();
      if (user) setUserId(user.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-dash-text tracking-tight uppercase">Community Feed</h1>
        <p className="text-dash-text-dim text-sm italic font-medium">Connect with fellow athletes and share your progress.</p>
      </div>

      <CreatePost onPostCreated={fetchData} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
          <p className="text-xs text-dash-text-dim font-bold tracking-widest uppercase">Loading your feed...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={userId} onDelete={fetchData} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-dash-card border border-dash-border-subtle rounded-3xl opacity-50 grayscale">
               <span className="text-6xl block mb-4">📭</span>
               <p className="text-sm font-bold text-dash-text-dim uppercase tracking-widest">Feed is empty. Start the conversation!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
