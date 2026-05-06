"use client";

import { useState } from "react";
import { communityService } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"TEXT" | "IMAGE" | "VIDEO">("TEXT");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await communityService.createPost({
        content,
        mediaUrl: mediaUrl || undefined,
        mediaType,
        privacy
      });

      if (res.success) {
        setContent("");
        setMediaUrl("");
        setMediaType("TEXT");
        triggerToast("Success", "Post created successfully", "success");
        onPostCreated();
      } else {
        triggerToast("Error", res.error || "Failed to create post", "error");
      }
    } catch (err) {
      triggerToast("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dash-card border border-dash-border-subtle rounded-2xl p-6 mb-8 shadow-xl shadow-black/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind, athlete?"
          className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl p-4 text-dash-text focus:border-neon-blue outline-none transition-all resize-none h-24"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-2">
            <select 
              value={mediaType} 
              onChange={(e) => setMediaType(e.target.value as any)}
              className="bg-dash-bg border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text-dim outline-none"
            >
              <option value="TEXT">Text Only</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
            {mediaType !== "TEXT" && (
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Media URL (Placeholder)"
                className="flex-1 bg-dash-bg border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text outline-none focus:border-neon-blue"
              />
            )}
          </div>

          <div className="flex justify-between items-center">
            <select 
              value={privacy} 
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="bg-dash-bg border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text-dim outline-none"
            >
              <option value="PUBLIC">🌎 Public</option>
              <option value="PRIVATE">🔒 Friends Only</option>
            </select>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-2 bg-neon-blue text-dash-bg font-black rounded-lg text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
