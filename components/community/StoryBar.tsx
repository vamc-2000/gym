"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { communityService } from "@/services/communityService";
import { tokenManager } from "@/lib/auth";

const StoryItem = ({ story, i, isMe = false }: { story: any, i: number, isMe?: boolean }) => {
  const [error, setError] = useState(false);
  const fallback = `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.user?.name || story.name || 'G'}&backgroundColor=0d0d14`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group snap-start"
    >
      <div className="relative">
        <input 
          type="file" 
          id="story-upload" 
          className="hidden" 
          accept="image/*,video/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const res = await communityService.uploadMedia(file);
              if (res.success && res.data) {
                await communityService.createStory({
                  mediaUrl: res.data.url,
                  mediaType: file.type.startsWith("video") ? "video" : "image"
                });
                window.location.reload(); // Refresh to show new story
              }
            } catch (err) {}
          }}
        />
        <div 
          onClick={() => isMe && document.getElementById("story-upload")?.click()}
          className={`p-0.5 rounded-full transition-all duration-300 ${
          isMe 
            ? "bg-white/10" 
            : "bg-gradient-to-tr from-neon-blue to-purple-500 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
        } group-hover:scale-105`}>
          <div className="w-16 h-16 rounded-full border-2 border-dash-bg overflow-hidden bg-dash-card relative">
            <Image 
              src={error ? fallback : (story.mediaUrl || fallback)} 
              alt={story.user?.name || story.name || "Story"} 
              width={64} 
              height={64}
              onError={() => setError(true)}
              className="object-cover"
            />
            {isMe && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <Plus className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
        {!isMe && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-neon-blue rounded-full border-2 border-dash-bg shadow-[0_0_10px_rgba(0,245,255,0.8)]" />
        )}
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-neon-blue transition-colors w-16 text-center truncate">
        {isMe ? "Your Story" : (story.user?.name || "User")}
      </span>
    </motion.div>
  );
};

export default function StoryBar() {
  const [stories, setStories] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchStories = async () => {
      const res = await communityService.getStories();
      if (res.success) setStories(res.data || []);
    };
    fetchStories();
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex gap-6 overflow-x-auto py-2 no-scrollbar scroll-smooth snap-x">
      <StoryItem i={0} story={{ name: "Your Story" }} isMe={true} />
      {stories.map((story, i) => (
        <StoryItem key={story.id} story={story} i={i + 1} />
      ))}
    </div>
  );
}
