"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Avatar from "@/components/ui/Avatar";
import { motion } from "motion/react";
import {
  UploadCloud, User, AtSign, AlignLeft,
  MapPin, Trophy, Link2, Loader2, Save, X, Trash2
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { communityService } from "@/services/communityService";
import { profileSync } from "@/lib/profile-sync";
import { triggerToast } from "@/components/NotificationManager";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import PrivacySelector from "@/components/community/PrivacySelector";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile States
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [goal, setGoal] = useState("Build Muscle");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [youtube, setYoutube] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>("/community/edit-profile");
      if (res.success && res.data) {
        const d = res.data;
        setName(d.name || "");
        setUsername(d.username || "");
        setBio(d.bio || "");
        setGoal(d.goal || "Build Muscle");
        setLocation(d.location || "");
        setAvatar(d.avatar || "");
        setBanner(d.banner || "");
        setInstagram(d.socialLinks?.instagram || "");
        setTwitter(d.socialLinks?.twitter || "");
        setYoutube(d.socialLinks?.youtube || "");
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await communityService.uploadMedia(file);
      if (res.success && res.data?.url) {
        setAvatar(res.data.url);
        triggerToast("Success", "Avatar uploaded to R2", "success");
      } else {
        throw new Error(res.error || "R2 Upload failed");
      }
    } catch (err: any) {
      triggerToast("Error", err.message || "Failed to upload avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const res = await communityService.uploadMedia(file);
      if (res.success && res.data?.url) {
        setBanner(res.data.url);
        triggerToast("Success", "Banner uploaded to R2", "success");
      } else {
        throw new Error(res.error || "R2 Upload failed");
      }
    } catch (err: any) {
      triggerToast("Error", err.message || "Failed to upload banner", "error");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      triggerToast("Error", "Name and Username are mandatory", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient<any>("/community/edit-profile", {
        method: "PUT",
        body: {
          name,
          username,
          bio,
          goal,
          location,
          avatar,
          banner,
          socialLinks: {
            instagram,
            twitter,
            youtube
          }
        }
      });

      if (res.success) {
        // Sync profile across entire app instantly
        profileSync.emit({
          name,
          username,
          avatar,
          banner,
          bio,
          goal,
          location,
        });

        triggerToast("Success", "Telemetry settings synchronized", "success");
        router.push(`/community/profile/${username}`);
        // Force Next.js router to refetch server data
        router.refresh();
      } else {
        triggerToast("Failed", res.error || "Username may be duplicate", "error");
      }
    } catch (err: any) {
      triggerToast("Error", err.message || "Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest animate-pulse">Accessing account parameters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Profile Config</h2>
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-0.5">Edit credentials and social integrations</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Cover Banner zones */}
        <div className="space-y-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Cover Banner Picture</label>
          <div
            onClick={() => bannerInputRef.current?.click()}
            className="w-full h-36 rounded-3xl border border-dashed border-white/10 hover:border-neon-blue/40 bg-black/40 overflow-hidden relative cursor-pointer group flex items-center justify-center transition-all"
          >
            <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />

            {uploadingBanner ? (
              <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
            ) : banner ? (
              <>
                <Image src={banner} alt="Banner" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <UploadCloud className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center opacity-40 group-hover:opacity-80 transition-opacity">
                <UploadCloud className="w-6 h-6 text-white mx-auto mb-2" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Upload cover banner zone</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Avatar Zones */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="w-20 h-20 rounded-[1.5rem] border-2 border-white/5 bg-black/40 overflow-hidden relative cursor-pointer group flex items-center justify-center transition-all shrink-0"
          >
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

            {uploadingAvatar ? (
              <Loader2 className="w-6 h-6 text-neon-blue animate-spin" />
            ) : (
              <>
                <Avatar
                  src={avatar}
                  name={name || username || "Athlete"}
                  className="w-full h-full"
                  fallbackSizeClass="text-2xl font-black uppercase"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                  <UploadCloud className="w-4 h-4 text-white" />
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white">Custom Profile Avatar</p>
            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Recommended size: 250x250 PNG/JPG</p>
          </div>

          {avatar && (
            <button
              type="button"
              onClick={() => setAvatar("")}
              className="ml-auto w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Display Full Name"
            variant="dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kenji Sato"
          />

          <InputField
            label="Unique Username"
            variant="dark"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. sato_streak"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Profile Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter your fitness parameters and biography..."
            rows={3}
            className="w-full bg-[#08080c] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/20 focus:border-neon-blue outline-none transition-all resize-none font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/40 block">Fitness Focus Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-12 bg-[#08080c] border border-white/10 rounded-xl px-4 text-xs text-white focus:border-neon-blue outline-none transition-all cursor-pointer font-bold uppercase tracking-widest"
            >
              <option value="Build Muscle">Build Muscle</option>
              <option value="Lose Weight">Lose Weight</option>
              <option value="Increase Endurance">Increase Endurance</option>
              <option value="Strength Training">Strength Training</option>
            </select>
          </div>

          <InputField
            label="Base Location"
            variant="dark"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Tokyo, JP"
          />
        </div>

        {/* Social Ribbon Section */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-black/20 space-y-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Linked Sector Interfaces</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Instagram Handler"
              variant="dark"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="username"
            />
            <InputField
              label="Twitter Handler"
              variant="dark"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="username"
            />
            <InputField
              label="YouTube Handler"
              variant="dark"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="channel"
            />
          </div>
        </div>

        {/* Privacy Selection */}
        <PrivacySelector />

        {/* Action Panel */}
        <div className="pt-6 border-t border-white/5 flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Abort
          </button>
          <SubmitButton loading={saving} variant="neon">
            <Save className="w-3.5 h-3.5 mr-2" />
            Synchronize Parameters
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
