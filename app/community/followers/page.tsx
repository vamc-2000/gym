"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import { motion } from "motion/react";
import { Users, UserPlus, UserMinus, Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { triggerToast } from "@/components/NotificationManager";

export default function FollowersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "me";

  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/community/followers?username=${username}`);
      if (res.success && res.data) {
        setFollowers(res.data);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchFollowers();
  }, [username]);

  const handleFollowToggle = async (userId: string) => {
    try {
      const res = await apiClient<any>("/community/follow", {
        method: "POST",
        body: { targetUserId: userId }
      });
      if (res.success) {
        const following = res.data.following;
        setFollowers(prev => prev.map(f => {
          if (f.id === userId) {
            return { ...f, isFollowing: following };
          }
          return f;
        }));
        triggerToast("Sync Successful", following ? "Signal connected" : "Signal separated", "success");
      }
    } catch (e) {}
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Followers Signals</h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-0.5">Telemetry listing for @{username}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
        </div>
      ) : followers.length === 0 ? (
        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/10 bg-black/10 opacity-30">
          <Users className="w-10 h-10 text-white mx-auto mb-4 animate-pulse" />
          <p className="text-[10px] font-black text-white uppercase tracking-widest">No signals recorded in sector</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followers.map((f) => (
            <div
              key={f.id}
              className="p-4 bg-black/20 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-neon-blue/20 transition-all"
            >
              <div
                onClick={() => router.push(`/community/profile/${f.username}`)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Avatar
                  src={f.avatar}
                  name={f.name || f.username}
                  className="w-10 h-10 rounded-xl overflow-hidden bg-dash-card border border-white/5 shrink-0"
                  fallbackSizeClass="text-xs font-black uppercase"
                />
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tight">{f.name}</p>
                  <p className="text-[8px] font-black text-neon-blue uppercase mt-0.5">@{f.username}</p>
                </div>
              </div>

              <button
                onClick={() => handleFollowToggle(f.id)}
                className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  f.isFollowing
                    ? "bg-white/5 border border-white/10 text-white/50 hover:text-white"
                    : "bg-neon-blue text-dash-bg"
                }`}
              >
                {f.isFollowing ? "Connected" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
