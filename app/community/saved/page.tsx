"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import PostCard from "@/components/community/PostCard";
import { tokenManager } from "@/lib/auth";

export default function SavedPage() {
  const router = useRouter();

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>("/community/saved");
      if (res.success && res.data) {
        setSavedPosts(res.data);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchSavedPosts();
    const user = tokenManager.getUser();
    if (user) setCurrentUserId(user.id);
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Secured Collections</h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-0.5">Your private bookmarks vault</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="text-center py-24 rounded-[2rem] border border-dashed border-white/10 bg-black/10 opacity-30">
          <Bookmark className="w-10 h-10 text-white mx-auto mb-4 animate-pulse" />
          <p className="text-[10px] font-black text-white uppercase tracking-widest">No bookmark entries secured in vault</p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={fetchSavedPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
