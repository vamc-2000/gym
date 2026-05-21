"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, MapPin, Calendar, Link2, Settings,
  Flame, Grid, Play, Bookmark, CheckCircle2,
  Users, UserPlus, UserMinus, Globe, Loader2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { triggerToast } from "@/components/NotificationManager";
import { tokenManager } from "@/lib/auth";
import { profileSync } from "@/lib/profile-sync";
import PostCard from "@/components/community/PostCard";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"posts" | "reels" | "saved">("posts");
  const [items, setItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [togglingFollow, setTogglingFollow] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>(`/community/profile/${username}`);
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        triggerToast("Not Found", "Profile details missing or offline", "error");
      }
    } catch (e: any) {
      triggerToast("Error", e.message || "Failed to sync profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubTabItems = async () => {
    setItemsLoading(true);
    setItems([]);
    try {
      let endpoint = `/community/posts?username=${username}`;
      if (activeSubTab === "reels") {
        endpoint = `/community/reels?username=${username}`;
      } else if (activeSubTab === "saved") {
        endpoint = `/community/saved`;
      }

      const res = await apiClient<any>(endpoint);
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (e) {}
    setItemsLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    const user = tokenManager.getUser();
    if (user) setCurrentUserId(user.id);

    // Re-fetch profile when profileSync fires (after edit-profile save)
    const unsubscribe = profileSync.subscribe(() => {
      fetchProfile();
    });

    return () => { unsubscribe(); };
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchSubTabItems();
    }
  }, [activeSubTab, profile]);

  const handleFollowToggle = async () => {
    if (!profile || togglingFollow) return;
    setTogglingFollow(true);
    try {
      const res = await apiClient<any>("/community/follow", {
        method: "POST",
        body: { targetUserId: profile.id }
      });
      if (res.success) {
        const following = res.data.following;
        setProfile((prev: any) => ({
          ...prev,
          isFollowing: following,
          followersCount: following ? prev.followersCount + 1 : prev.followersCount - 1
        }));
        triggerToast("Sync Successful", following ? "Signals connected" : "Signals separated", "success");
      }
    } finally {
      setTogglingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest animate-pulse">Syncing User profile telemetry...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-32 opacity-40">
        <span className="text-6xl block mb-6">📡</span>
        <p className="text-xs font-black text-white uppercase tracking-widest">No active signals found for @{username}</p>
        <button
          onClick={() => router.push("/dashboard/community")}
          className="mt-6 px-6 py-3 bg-neon-blue text-dash-bg font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
        >
          Return to Grid
        </button>
      </div>
    );
  }

  const isOwnProfile = profile.id === currentUserId;

  return (
    <div className="space-y-12">
      {/* Premium Cover Banner + Avatar Panel */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-black/40 shadow-2xl">
        {/* Banner Cover */}
        <div className="h-44 w-full relative bg-gradient-to-r from-neon-blue/10 to-purple-500/10 border-b border-white/5">
          {profile.banner && (
            <Image
              src={`${profile.banner}${profile.banner.includes('?') ? '&' : '?'}v=${Date.now()}`}
              alt="Banner"
              fill
              className="object-cover"
              sizes="800px"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Profile Card Header */}
        <div className="p-8 -mt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            {/* Avatar Frame */}
            <div className="relative group">
              <Avatar
                src={profile.avatar}
                name={profile.username || profile.name || "Athlete"}
                className="w-28 h-28 rounded-[2rem] border-4 border-[#08080c] bg-dash-card overflow-hidden shadow-2xl"
                fallbackSizeClass="text-3xl font-black uppercase"
              />
              {profile.streak > 0 && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 border-2 border-[#08080c] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                  <Flame className="w-3 h-3 text-white fill-white" />
                  <span className="text-[9px] font-black text-white">{profile.streak}</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-xl font-black text-white tracking-tight uppercase">{profile.name}</h2>
                {profile.verified && (
                  <CheckCircle2 className="w-4 h-4 text-neon-blue fill-neon-blue/10 animate-pulse" />
                )}
              </div>
              <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest">@{profile.username}</p>
              <p className="text-xs text-white/70 max-w-sm">{profile.bio}</p>

              {/* Detail Info Badges */}
              <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap pt-2 text-[8px] font-black text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-neon-yellow" />
                  <span className="text-white">{profile.goal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex gap-2">
            {isOwnProfile ? (
              <button
                onClick={() => router.push("/community/edit-profile")}
                className="flex items-center gap-2 px-5 py-3.5 bg-white/5 border border-white/10 hover:border-neon-blue/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={togglingFollow}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                  profile.isFollowing
                    ? "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                    : "bg-neon-blue text-dash-bg"
                }`}
              >
                {profile.isFollowing ? (
                  <>
                    <UserMinus className="w-3.5 h-3.5" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Connect
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Streaks and Followers Counters Panel */}
        <div className="border-t border-white/5 p-6 bg-black/30 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-black text-white tracking-tighter">{profile.postsCount + profile.reelsCount}</p>
            <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mt-1">Total Deployments</p>
          </div>
          <div className="border-x border-white/5 cursor-pointer hover:bg-white/2 transition-colors py-1 rounded-2xl">
            <p className="text-lg font-black text-white tracking-tighter">{profile.followersCount}</p>
            <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mt-1">Followers Signals</p>
          </div>
          <div className="cursor-pointer hover:bg-white/2 transition-colors py-1 rounded-2xl">
            <p className="text-lg font-black text-white tracking-tighter">{profile.followingCount}</p>
            <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mt-1">Following Signals</p>
          </div>
        </div>
      </div>

      {/* Social Links Ribbon */}
      {(profile.socialLinks?.instagram || profile.socialLinks?.twitter || profile.socialLinks?.youtube) && (
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex justify-center gap-6 max-w-sm mx-auto">
          {profile.socialLinks.instagram && (
            <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-neon-blue hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          )}
          {profile.socialLinks.twitter && (
            <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-neon-blue hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          )}
          {profile.socialLinks.youtube && (
            <a href={`https://youtube.com/${profile.socialLinks.youtube}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-neon-blue hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          )}
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex justify-center border-b border-white/5 pb-4 gap-6 max-w-lg mx-auto">
        {[
          { id: "posts", label: "Posts Grid", icon: Grid },
          { id: "reels", label: "Reels View", icon: Play },
          ...(isOwnProfile ? [{ id: "saved", label: "Bookmarks", icon: Bookmark }] : []),
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`flex items-center gap-2 pb-2.5 border-b-2 font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer ${
              activeSubTab === t.id
                ? "border-neon-blue text-neon-blue"
                : "border-transparent text-white/40 hover:text-white"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="max-w-3xl mx-auto">
        {itemsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 rounded-[2rem] border border-dashed border-white/10 bg-black/10 opacity-30">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Grid Section Empty</p>
          </div>
        ) : activeSubTab === "reels" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((r: any) => (
              <div
                key={r.id}
                onClick={() => router.push(`/dashboard/community?tab=Reels`)}
                className="aspect-[9/16] rounded-3xl overflow-hidden relative border border-white/5 bg-black/40 cursor-pointer group shadow-lg"
              >
                <video src={r.videoUrl} muted className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[600ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-4">
                  <p className="text-[9px] text-white font-medium line-clamp-2">{r.caption}</p>
                  <div className="flex gap-4 mt-2 text-[8px] font-black uppercase text-neon-blue">
                    <span>{r.likesCount} Likes</span>
                    <span>{r.commentsCount} Comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onDelete={fetchSubTabItems}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
