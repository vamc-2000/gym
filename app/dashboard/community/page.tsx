"use client";

import { useEffect, useState } from "react";
import { communityService, Post } from "@/services/communityService";
import CreatePost from "@/components/community/CreatePost";
import PostCard from "@/components/community/PostCard";
import StoryBar from "@/components/community/StoryBar";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import RightSidebar from "@/components/community/RightSidebar";
import MessagesView from "@/components/community/MessagesView";
import FriendsView from "@/components/community/FriendsView";
import ExploreView from "@/components/community/ExploreView";
import ReelsView from "@/components/community/ReelsView";
import ChallengesView from "@/components/community/ChallengesView";
import { tokenManager } from "@/lib/auth";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("Home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [particles, setParticles] = useState<{top:string, left:string, duration:string, delay:string}[]>([]);

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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
    setParticles([...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 10}s`,
      delay: `${Math.random() * 5}s`
    })));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-dash-bg text-white selection:bg-neon-blue selection:text-dash-bg flex overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
        {particles.map((p, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-10"
            style={{
              top: p.top,
              left: p.left,
              animation: `float-particle ${p.duration} infinite linear`,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_360px] w-full h-screen overflow-hidden">
        
        {/* Left Sidebar - Inner Community Navigation */}
        <aside className="hidden lg:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-3xl h-full overflow-hidden">
          <CommunitySidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Center Feed - Primary Content Area */}
        <main className="flex flex-col h-full overflow-hidden relative">
          {/* Custom Header for Community */}
          <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center gap-4">
               <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                 Streak <span className="text-neon-blue">Pulse</span>
               </h1>
               <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex flex-col items-end">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Network Status</p>
                 <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest">Active • {posts.length} Sequences</p>
               </div>
            </div>
          </header>

          {activeTab === "Messages" ? (
            <div className="flex-1 w-full h-full p-4 overflow-hidden">
              <MessagesView />
            </div>
          ) : activeTab === "Friends" ? (
            <div className="flex-1 w-full h-full p-6 overflow-y-auto custom-scrollbar">
              <FriendsView />
            </div>
          ) : activeTab === "Explore" ? (
            <div className="flex-1 w-full h-full p-6 overflow-y-auto custom-scrollbar">
              <ExploreView />
            </div>
          ) : activeTab === "Reels" ? (
            <div className="flex-1 w-full h-full p-6 overflow-y-auto custom-scrollbar">
              <ReelsView />
            </div>
          ) : activeTab === "Challenges" ? (
            <div className="flex-1 w-full h-full p-6 overflow-y-auto custom-scrollbar">
              <ChallengesView />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pt-8 pb-32">
              <div className="max-w-4xl mx-auto px-6 space-y-8">
                {/* Stories */}
                <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
                  <StoryBar />
                </div>

                {/* Post Creator */}
                <CreatePost onPostCreated={fetchData} />

                {/* Feed Content */}
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-96 w-full bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} currentUserId={userId} onDelete={fetchData} />
                    ))}
                    {posts.length === 0 && (
                      <div className="text-center py-24 rounded-3xl border border-dashed border-white/10 bg-black/20 opacity-40">
                        <span className="text-6xl block mb-6">📡</span>
                        <p className="text-xs font-black text-white uppercase tracking-[0.3em]">No transmissions detected in sector.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Social Intelligence */}
        <aside className="hidden xl:flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-3xl h-full overflow-y-auto no-scrollbar">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile Back Button (Since we're fixed inset-0) */}
      <button 
        onClick={() => window.history.back()}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-neon-blue text-dash-bg rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
}
