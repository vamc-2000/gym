"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Hash, Users, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api";
import PostCard from "./PostCard";
import { triggerToast } from "@/components/NotificationManager";
import { tokenManager } from "@/lib/auth";

export default function ExploreView() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any>({ posts: [], suggestions: [], trending: [] });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const fetchExplore = async (searchQuery = "") => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/explore?query=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplore();
    const u = tokenManager.getUser();
    if (u) setUserId(u.id);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExplore(query);
  };

  const handleFollow = async (friendId: string) => {
    const res = await apiClient<any>("/community/friends/request", {
      method: "POST",
      body: { friendId }
    });
    if (res.success) {
      triggerToast("Success", "Friend request transmitted!", "success");
      setData((prev: any) => ({
        ...prev,
        suggestions: prev.suggestions.filter((s: any) => s.id !== friendId)
      }));
    } else {
      triggerToast("Error", res.error || "Failed to send request", "error");
    }
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transmissions, hashtags, or fitness plans..."
          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 pl-14 text-sm text-white placeholder-white/30 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
        />
        <Search className="absolute left-5 top-4.5 w-5 h-5 text-white/30" />
        <button
          type="submit"
          className="absolute right-3 top-2.5 h-9 px-5 bg-neon-blue text-dash-bg font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
        >
          Scan
        </button>
      </form>

      {/* Suggested Connections & Trending Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Suggested connections */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-4 h-4 text-neon-blue" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Recommended Athletes</h4>
          </div>
          <div className="space-y-4">
            {data.suggestions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-black text-white uppercase">{s.name}</p>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{s.fitnessLevel || "Athlete"}</p>
                </div>
                <button
                  onClick={() => handleFollow(s.id)}
                  className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-dash-bg transition-all"
                >
                  Connect
                </button>
              </div>
            ))}
            {data.suggestions.length === 0 && (
              <p className="text-[8px] font-black text-white/20 text-center uppercase py-4">No suggestions at this moment</p>
            )}
          </div>
        </div>

        {/* Trending Hashtags */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/20">
          <div className="flex items-center gap-3 mb-6">
            <Hash className="w-4 h-4 text-neon-blue" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Trending Sectors</h4>
          </div>
          <div className="space-y-3">
            {data.trending.map((t: any) => (
              <div
                key={t.tag}
                onClick={() => {
                  setQuery(`#${t.tag}`);
                  fetchExplore(`#${t.tag}`);
                }}
                className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:border-neon-blue/40 hover:bg-white/10 transition-all group"
              >
                <span className="text-[10px] font-black text-white/70 group-hover:text-neon-blue transition-colors">#{t.tag}</span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{t.posts} Transmissions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
          <Sparkles className="w-4 h-4 text-neon-blue animate-pulse" />
          <h4 className="text-xs font-black text-white uppercase tracking-widest">Explore Feed</h4>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 w-full bg-white/5 rounded-3xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {data.posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={userId}
                onDelete={() => fetchExplore(query)}
              />
            ))}
            {data.posts.length === 0 && (
              <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-black/20 opacity-40">
                <span className="text-4xl block mb-4">📡</span>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">No matching frequencies detected.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
