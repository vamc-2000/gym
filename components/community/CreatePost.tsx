"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, Video, Tag, Smile, Send } from "lucide-react";
import { communityService } from "@/services/communityService";
import { triggerToast } from "@/components/NotificationManager";

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setMediaType(type);
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

      if (mediaType !== "none" && file) {
        const uploadRes = await communityService.uploadMedia(file);
        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.error || "Failed to upload media");
        }
        finalMediaUrl = uploadRes.data.url;
      }

      const res = await communityService.createPost({
        content,
        mediaUrl: finalMediaUrl,
        mediaType,
        privacy: "public"
      });

      if (res.success) {
        setContent("");
        setFile(null);
        setPreviewUrl(null);
        setMediaType("none");
        triggerToast("Success", "Transmission established", "success");
        onPostCreated();
      }
    } catch (err: any) {
      triggerToast("Error", err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/40 rounded-2xl p-4 border border-cyan-400/10 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-blue to-purple-500 opacity-20" />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
           <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex-shrink-0 flex items-center justify-center text-neon-blue font-black text-xs">
             GS
           </div>
           <textarea
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder="Relay your progress..."
             className="flex-1 bg-transparent border-none text-white placeholder:text-white/10 text-sm font-medium outline-none resize-none h-20 pt-1.5"
           />
        </div>

        {previewUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-xl overflow-hidden border border-white/5 aspect-video"
          >
            {mediaType === "image" ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <video src={previewUrl} className="w-full h-full object-cover" />
            )}
            <button 
              type="button"
              onClick={() => { setFile(null); setPreviewUrl(null); setMediaType("none"); }}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md text-white rounded-lg flex items-center justify-center hover:bg-red-500 transition-all text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <div className="relative group/action">
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, "image")} accept="image/*" />
               <div className="p-2.5 text-white/20 hover:text-neon-blue transition-all cursor-pointer">
                 <ImageIcon className="w-4 h-4" />
               </div>
            </div>
            <div className="relative group/action">
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => handleFileChange(e, "video")} accept="video/*" />
               <div className="p-2.5 text-white/20 hover:text-purple-500 transition-all cursor-pointer">
                 <Video className="w-4 h-4" />
               </div>
            </div>
            <button type="button" className="p-2.5 text-white/20 hover:text-neon-yellow transition-all cursor-pointer">
              <Tag className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-neon-blue text-dash-bg font-black rounded-xl text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 cursor-pointer"
          >
            {loading ? "Syncing..." : "Relay"}
            {!loading && <Send className="w-3 h-3" />}
          </button>
        </div>
      </form>
    </div>
  );
}
