"use client";

import { useState } from "react";
import { communityService } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      let finalMediaUrl = undefined;

      // Handle Upload if file exists
      if (mediaType !== "none" && file) {
        const uploadRes = await communityService.uploadMedia(file);
        
        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || "Failed to upload media");
        }

        finalMediaUrl = uploadRes.data.url;
        triggerToast("Success", "Media uploaded successfully", "success");
      }

      const res = await communityService.createPost({
        content,
        mediaUrl: finalMediaUrl,
        mediaType,
        privacy
      });

      if (res.success) {
        setContent("");
        setFile(null);
        setPreviewUrl(null);
        setMediaType("none");
        triggerToast("Success", "Post created successfully", "success");
        onPostCreated();
      } else {
        triggerToast("Error", res.error || "Failed to create post", "error");
      }
    } catch (err: any) {
      triggerToast("Error", err.message || "Something went wrong", "error");
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
          className="w-full bg-dash-bg border border-dash-border-subtle rounded-xl p-4 text-white focus:border-neon-blue outline-none transition-all resize-none h-24 shadow-inner"
        />

        {previewUrl && mediaType !== "none" && (
          <div className="relative rounded-xl overflow-hidden border border-dash-border-subtle group">
            {mediaType === "image" ? (
              <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-60 object-cover" />
            ) : (
              <video src={previewUrl} className="w-full h-auto max-h-60 object-cover" />
            )}
            <button 
              type="button"
              onClick={() => { setFile(null); setPreviewUrl(null); }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-2">
            <select 
              value={mediaType} 
              onChange={(e) => {
                setMediaType(e.target.value as any);
                if (e.target.value === "none") { setFile(null); setPreviewUrl(null); }
              }}
              className="bg-dash-bg border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text hover:border-neon-blue/50 outline-none transition-all cursor-pointer"
            >
              <option value="none">📝 Text Only</option>
              <option value="image">📷 Image</option>
              <option value="video">🎥 Video</option>
            </select>
            
            {mediaType !== "none" && (
              <div className="flex-1 relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={mediaType === "image" ? "image/*" : "video/*"}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="h-full w-full bg-dash-bg border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text flex items-center gap-2 truncate">
                  <span className="opacity-60">{file ? "📎" : "➕"}</span>
                  <span>{file ? file.name : `Select ${mediaType}`}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <select 
              value={privacy} 
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="bg-dash-bg border border-dash-border-subtle rounded-lg px-3 py-2 text-xs text-dash-text hover:border-neon-blue/50 outline-none transition-all cursor-pointer"
            >
              <option value="public">🌎 Public Feed</option>
              <option value="private">🔒 Friends Only</option>
            </select>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-2 bg-neon-blue text-dash-bg font-black rounded-lg text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 min-w-[100px] flex items-center justify-center gap-2"
            >
              {loading && <div className="w-3 h-3 border-2 border-dash-bg/20 border-t-dash-bg rounded-full animate-spin" />}
              {loading ? "Uploading..." : "Post"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
