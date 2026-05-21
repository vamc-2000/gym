"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { X, Save, Loader2, UploadCloud, Trash2 } from "lucide-react";
import { communityService } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";

interface EditPostModalProps {
  post: {
    id: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    privacy: string;
  };
  onClose: () => void;
  onSaved: (updated: any) => void;
}

export default function EditPostModal({ post, onClose, onSaved }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [privacy, setPrivacy] = useState(post.privacy);
  const [mediaUrl, setMediaUrl] = useState(post.mediaUrl || "");
  const [mediaType, setMediaType] = useState(post.mediaType || "none");
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const res = await communityService.uploadMedia(file);
      if (res.success && res.data?.url) {
        setMediaUrl(res.data.url);
        setMediaType(file.type.startsWith("video") ? "video" : "image");
        triggerToast("Success", "Media uploaded to R2", "success");
      } else {
        throw new Error(res.error || "Upload failed");
      }
    } catch (err: any) {
      triggerToast("Error", err.message, "error");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      triggerToast("Error", "Post content cannot be empty", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await communityService.editPost(post.id, {
        content: content.trim(),
        privacy,
        mediaUrl: mediaUrl || "",
        mediaType,
      });
      if (res.success) {
        triggerToast("Synchronized", "Post parameters updated successfully", "success");
        onSaved(res.data);
        onClose();
      } else {
        triggerToast("Error", res.error || "Failed to update", "error");
      }
    } catch (err: any) {
      triggerToast("Error", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0a0a12] border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Edit Transmission</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Content */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.25em] block">
              Content Parameters
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-xs text-white placeholder-white/20 focus:border-neon-blue/40 outline-none transition-all resize-none font-medium"
              placeholder="Update your post content..."
            />
          </div>

          {/* Privacy Toggle */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.25em] block">
              Visibility Mode
            </label>
            <div className="flex gap-3">
              {["public", "private"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrivacy(p)}
                  className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    privacy === p
                      ? p === "public"
                        ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                        : "bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow"
                      : "bg-white/[0.02] border-white/[0.06] text-white/30 hover:text-white/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Media Preview & Replace */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.25em] block">
              Media Attachment
            </label>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />

            {mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-black/40">
                <div className="aspect-video relative">
                  {mediaType === "video" ? (
                    <video src={mediaUrl} className="w-full h-full object-cover" controls />
                  ) : (
                    <Image src={mediaUrl} alt="Media" fill className="object-cover" sizes="500px" />
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-neon-blue transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setMediaUrl(""); setMediaType("none"); }}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="w-full py-6 border border-dashed border-white/[0.08] hover:border-neon-blue/30 rounded-2xl bg-white/[0.01] flex flex-col items-center gap-2 transition-all cursor-pointer"
              >
                {uploadingMedia ? (
                  <Loader2 className="w-5 h-5 text-neon-blue animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-white/20" />
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                      Attach Media File
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-white/[0.04]">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-neon-blue text-dash-bg text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
