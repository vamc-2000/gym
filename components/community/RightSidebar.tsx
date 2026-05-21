"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { Hash, Zap, Users, Trophy, Star, ArrowUpRight } from "lucide-react";
import { communityService } from "@/services/communityService";
import { friendService } from "@/services/friendService";
import { triggerToast } from "@/components/NotificationManager";
import { tokenManager } from "@/lib/auth";

const FriendItem = ({ friend, onFollow }: { friend: any, onFollow: (id: string) => void }) => {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex items-center justify-between group cursor-pointer px-2"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <Avatar
            src={friend.avatar}
            name={friend.name}
            className="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-dash-card"
            fallbackSizeClass="text-[10px] font-black uppercase"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-dash-bg rounded-full bg-white/10" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-neon-blue transition-colors truncate">{friend.name}</p>
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Athlete</p>
        </div>
      </div>
      <button 
        onClick={() => onFollow(friend.id)}
        className="p-1 hover:bg-neon-blue/20 rounded-md transition-all group-hover:opacity-100 opacity-40"
      >
        <ArrowUpRight className="w-3.5 h-3.5 text-neon-blue" />
      </button>
    </motion.div>
  );
};

export default function RightSidebar() {
  const [trending, setTrending] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trendRes, suggestRes, friendsRes] = await Promise.all([
        communityService.getTrendingHashtags(),
        communityService.getSuggestions(),
        friendService.getFriendsData()
      ]);
      if (trendRes.success) setTrending(trendRes.data || []);
      if (suggestRes.success) setSuggestions(suggestRes.data || []);
      if (friendsRes.success && friendsRes.data?.friends) {
        // Extract the actual friend object based on who sent the request
        // Since getFriendsData returns { id, userId, friendId, user, friend }
        setFriends(friendsRes.data.friends);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const user = tokenManager.getUser();
    if (user) setUserId(user.id);
  }, []);

  const handleFollow = async (friendId: string) => {
    const res = await communityService.sendFriendRequest(friendId);
    if (res.success) {
      triggerToast("Success", "Request transmitted", "success");
      setSuggestions(prev => prev.filter(s => s.id !== friendId));
    } else {
      triggerToast("Error", res.error || "Failed to send request", "error");
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-6 space-y-10">
      
      {/* Community Challenge */}
      <div className="bg-black/40 p-6 rounded-3xl border border-neon-blue/20 relative overflow-hidden group cursor-pointer">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl group-hover:bg-neon-blue/20 transition-all" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
              <Trophy className="w-5 h-5 text-neon-blue animate-bounce" />
            </div>
            <span className="text-[8px] font-black text-neon-blue bg-neon-blue/10 px-3 py-1.5 rounded-lg border border-neon-blue/20 uppercase tracking-widest">Global</span>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-1">Summer Shred</h3>
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mb-6">Goal: 1M Calories</p>
          
          <div className="space-y-3">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-white/40">Sync Rate</span>
                <span className="text-neon-blue">68%</span>
             </div>
             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="h-full bg-neon-blue shadow-[0_0_10px_rgba(0,245,255,0.4)]" 
                />
             </div>
          </div>
        </div>
      </div>

      {/* My Circle (Active Friends) */}
      {friends.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-white/40" />
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">My Circle</h4>
            </div>
          </div>
          <div className="space-y-4">
            {friends.map((f: any) => {
              const friendUser = f.user?.id === userId ? f.friend : f.user;
              if (!friendUser) return null;
              
              return (
                <div key={f.id} className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar
                        src={friendUser.avatar}
                        name={friendUser.name}
                        className="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-dash-card"
                        fallbackSizeClass="text-[10px] font-black uppercase"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-dash-bg rounded-full bg-neon-green" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{friendUser.name}</p>
                      <p className="text-[8px] font-black text-neon-green uppercase tracking-widest">Online</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested Connections */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-white/40" />
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Network Nodes</h4>
          </div>
        </div>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <FriendItem key={user.id} friend={user} onFollow={handleFollow} />
          ))}
          {suggestions.length === 0 && !loading && (
            <p className="text-[8px] font-black text-white/10 uppercase tracking-widest text-center">No new nodes detected</p>
          )}
        </div>
      </div>

      {/* Trending Hashtags */}
      <div>
        <div className="flex items-center gap-3 mb-6 px-2">
          <Hash className="w-4 h-4 text-white/40" />
          <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Trending</h4>
        </div>
        <div className="space-y-2 px-2">
          {trending.map((item) => (
            <div key={item.tag} className="flex justify-between items-center group cursor-pointer py-1">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white/60 group-hover:text-neon-blue transition-colors truncate">#{item.tag}</p>
                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-0.5">{item.posts} transmissions</p>
              </div>
              <Zap className="w-3 h-3 text-neon-blue opacity-0 group-hover:opacity-100 transition-all shrink-0" />
            </div>
          ))}
          {trending.length === 0 && !loading && (
            <p className="text-[8px] font-black text-white/10 uppercase tracking-widest text-center">No active frequencies</p>
          )}
        </div>
      </div>
    </div>
  );
}
