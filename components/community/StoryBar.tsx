"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, Loader2 } from "lucide-react";
import { communityService } from "@/services/communityService";
import { useProfile } from "@/hooks/use-profile";
import Avatar from "@/components/ui/Avatar";
import { useStoryStore, GroupedStories, Story } from "@/store/useStoryStore";
import StoryViewer from "./stories/StoryViewer";
import imageCompression from 'browser-image-compression';

const StoryItem = ({ 
  group, 
  i, 
  onClick,
}: { 
  group: GroupedStories, 
  i: number,
  onClick: () => void 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group snap-start"
    >
      <div className="relative">
        <div 
          className={`p-0.5 rounded-full transition-all duration-300 ${
          group.hasUnseen 
            ? "bg-gradient-to-tr from-neon-blue to-purple-500 shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            : "bg-white/20"
        } group-hover:scale-105`}>
          <div className="w-16 h-16 rounded-full border-2 border-dash-bg overflow-hidden bg-dash-card relative">
            <Avatar
              src={group.user.avatar}
              name={group.user.username || group.user.name || "U"}
              className="w-full h-full rounded-full"
              fallbackSizeClass="text-lg font-black uppercase"
            />
          </div>
        </div>
      </div>
      <span className="text-[10px] font-medium tracking-wide text-white/70 group-hover:text-neon-blue transition-colors w-16 text-center truncate">
        {group.user.username || group.user.name}
      </span>
    </motion.div>
  );
};

export default function StoryBar() {
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const { user } = useProfile();
  const { groupedStories, setGroupedStories, addStory, openViewer } = useStoryStore();

  const fetchStories = async () => {
    if (!user) return;
    const res = await communityService.getStories();
    if (res.success && res.data) {
      const groups = new Map<string, GroupedStories>();
      
      res.data.forEach((story: Story) => {
        const uid = story.userId;
        if (!groups.has(uid)) {
          groups.set(uid, {
            userId: uid,
            user: story.user!,
            stories: [],
            hasUnseen: false
          });
        }
        const group = groups.get(uid)!;
        group.stories.push(story);
        
        // check if unseen
        if (uid !== user.id) {
          const viewed = story.views?.some(v => v.userId === user.id);
          if (!viewed) {
            group.hasUnseen = true;
          }
        }
      });
      
      const groupArr = Array.from(groups.values());
      groupArr.sort((a, b) => {
        if (a.hasUnseen && !b.hasUnseen) return -1;
        if (!a.hasUnseen && b.hasUnseen) return 1;
        return new Date(b.stories[0].createdAt).getTime() - new Date(a.stories[0].createdAt).getTime();
      });
      
      setGroupedStories(groupArr);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStories();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      // Client-side media optimization architecture implementation
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp'
        };
        try {
          const compressedFile = await imageCompression(file, options);
          // Overwrite the original file with the compressed file
          file = new File([compressedFile], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });
        } catch (compressionError) {
          console.warn("Compression failed, uploading original image", compressionError);
        }
      }

      const res = await communityService.uploadMedia(file);
      if (res.success && res.data) {
        const storyRes = await communityService.createStory({
          mediaUrl: res.data.url,
          mediaType: file.type.startsWith("video") ? "video" : "image"
        });
        if (storyRes.success && storyRes.data) {
          addStory(storyRes.data, user);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (!mounted) return null;

  return (
    <>
      <div className="flex gap-6 overflow-x-auto py-2 no-scrollbar scroll-smooth snap-x">
        {/* Your Story Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group snap-start"
        >
          <div className="relative">
            <input 
              type="file" 
              id="story-upload" 
              className="hidden" 
              accept="image/*,video/mp4,video/quicktime"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div 
              onClick={() => !uploading && document.getElementById("story-upload")?.click()}
              className="p-0.5 rounded-full transition-all duration-300 bg-white/10 group-hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dash-bg overflow-hidden bg-dash-card relative">
                <Avatar
                  src={user?.avatar}
                  name={user?.username || user?.name || "U"}
                  className="w-full h-full rounded-full"
                  fallbackSizeClass="text-lg font-black uppercase"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-neon-blue animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-medium tracking-wide text-white/70 group-hover:text-white transition-colors w-16 text-center truncate">
            Your Story
          </span>
        </motion.div>

        {/* Other Users' Stories */}
        {groupedStories.map((group, i) => (
          <StoryItem 
            key={group.userId} 
            group={group} 
            i={i + 1} 
            onClick={() => openViewer(i)}
          />
        ))}
      </div>

      <StoryViewer />
    </>
  );
}
