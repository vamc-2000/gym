"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Trash } from "lucide-react";
import { useStoryStore } from "@/store/useStoryStore";
import { communityService } from "@/services/communityService";
import { useProfile } from "@/hooks/use-profile";
import Avatar from "@/components/ui/Avatar";

export default function StoryViewer() {
  const { isOpen, groupedStories, initialUserIndex, initialStoryIndex, closeViewer, removeStory, markGroupAsSeen } = useStoryStore();
  const { user: currentUser } = useProfile();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Update state when initial indices change (on modal open)
  useEffect(() => {
    if (isOpen) {
      setUserIndex(initialUserIndex);
      setStoryIndex(initialStoryIndex);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialUserIndex, initialStoryIndex]);

  useEffect(() => {
    if (!isOpen || groupedStories.length === 0) return;
    
    const currentUserStories = groupedStories[userIndex];
    if (!currentUserStories) return;
    
    const currentStory = currentUserStories.stories[storyIndex];
    if (!currentStory) return;

    // Mark as viewed in backend
    if (currentUser && currentStory.userId !== currentUser.id) {
      const hasViewed = currentStory.views?.some((v: any) => v.userId === currentUser.id);
      if (!hasViewed) {
        communityService.markStoryViewed(currentStory.id).catch(() => {});
      }
      
      // Optimistically mark group as seen if they just started watching it
      if (currentUserStories.hasUnseen) {
         markGroupAsSeen(userIndex);
      }
    }

    let timer: NodeJS.Timeout;
    const isVideo = currentStory.mediaType === "video";
    
    if (!isVideo && !isPaused) {
      // 5 seconds for images
      const startTime = Date.now();
      const duration = 5000;
      
      const animateProgress = () => {
        if (isPaused) return; // Note: this is a bit tricky with setInterval, better to use requestAnimationFrame, but interval works for simple case
        
        const now = Date.now();
        const elapsed = now - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          handleNext();
        } else {
          timer = setTimeout(animateProgress, 50);
        }
      };
      
      timer = setTimeout(animateProgress, 50);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, userIndex, storyIndex, isPaused, groupedStories, currentUser, isDeleting]);

  const handleNext = () => {
    const currentUserStories = groupedStories[userIndex];
    if (storyIndex < currentUserStories.stories.length - 1) {
      setStoryIndex((prev: number) => prev + 1);
      setProgress(0);
    } else if (userIndex < groupedStories.length - 1) {
      setUserIndex((prev: number) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      closeViewer();
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((prev: number) => prev - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      setUserIndex((prev: number) => prev - 1);
      setStoryIndex(groupedStories[userIndex - 1].stories.length - 1);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    const currentGroup = groupedStories[userIndex];
    const currentStory = currentGroup?.stories[storyIndex];
    if (!currentStory || !currentUser || currentStory.userId !== currentUser.id) return;
    
    setIsDeleting(true);
    setIsPaused(true);
    try {
      const res = await communityService.deleteStory(currentStory.id);
      if (res.success) {
        removeStory(currentStory.id);
        // After removing, we need to handle navigation
        // If it was the last story in the group, we need to move to next user or close
        // Let's just re-evaluate current indices
        if (currentGroup.stories.length === 1) { // It was the last one
           if (userIndex < groupedStories.length - 1) {
              setStoryIndex(0); // the next user will shift into this index
           } else {
              closeViewer();
           }
        } else {
           // Move to next story if possible, else previous
           if (storyIndex >= currentGroup.stories.length - 1) {
              setStoryIndex(currentGroup.stories.length - 2);
           }
        }
        setProgress(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setIsPaused(false);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isPaused) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
      if (p >= 100) {
        handleNext();
      }
    }
  };

  if (!isOpen || groupedStories.length === 0) return null;

  const currentGroup = groupedStories[userIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  if (!currentGroup || !currentStory) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[100] bg-black sm:bg-black/90 sm:backdrop-blur-xl flex items-center justify-center overflow-hidden touch-none"
        >
          {/* Main Container */}
          <div className="relative w-full h-full sm:w-[400px] sm:h-[800px] sm:max-h-[90vh] bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-4 bg-gradient-to-b from-black/60 to-transparent">
              {currentGroup.stories.map((story: any, idx: number) => (
                <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: idx < storyIndex ? "100%" : idx === storyIndex ? `${progress}%` : "0%"
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-20 flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <Avatar
                  src={currentGroup.user.avatar}
                  name={currentGroup.user.username || currentGroup.user.name}
                  className="w-8 h-8 rounded-full border border-white/20"
                />
                <span className="text-white text-sm font-semibold text-shadow-sm">
                  {currentGroup.user.username || currentGroup.user.name}
                </span>
                <span className="text-white/60 text-xs ml-2 text-shadow-sm">
                  {Math.floor((new Date().getTime() - new Date(currentStory.createdAt).getTime()) / (1000 * 60 * 60))}h
                </span>
              </div>

              <div className="flex items-center gap-4">
                {currentUser && currentStory.userId === currentUser.id && (
                  <button 
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    className="text-white hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash className="w-5 h-5 drop-shadow-lg" />
                  </button>
                )}
                {currentStory.mediaType === "video" && (
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-neon-blue transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5 drop-shadow-lg" /> : <Volume2 className="w-5 h-5 drop-shadow-lg" />}
                  </button>
                )}
                <button onClick={closeViewer} className="text-white hover:text-red-500 transition-colors">
                  <X className="w-6 h-6 drop-shadow-lg" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div 
              className="flex-1 relative w-full h-full flex items-center justify-center bg-black"
              onPointerDown={() => {
                setIsPaused(true);
                if (videoRef.current) videoRef.current.pause();
              }}
              onPointerUp={() => {
                setIsPaused(false);
                if (videoRef.current) videoRef.current.play();
              }}
              onPointerLeave={() => {
                setIsPaused(false);
                if (videoRef.current) videoRef.current.play();
              }}
            >
              {/* Blurred background telemetry to prevent black bars for non-9:16 formats */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
                {currentStory.mediaType === "video" ? (
                  <video
                    src={currentStory.mediaUrl}
                    className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={currentStory.mediaUrl}
                    alt="Story Blur"
                    className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
              </div>

              {currentStory.mediaType === "video" ? (
                <video
                  ref={videoRef}
                  src={currentStory.mediaUrl}
                  className="w-full h-full object-contain relative z-10"
                  autoPlay
                  playsInline
                  muted={isMuted}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleNext}
                />
              ) : (
                <img
                  src={currentStory.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-contain relative z-10"
                />
              )}

              {/* Tap zones for navigation */}
              <div 
                className="absolute inset-y-0 left-0 w-1/3 z-10" 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              />
              <div 
                className="absolute inset-y-0 right-0 w-1/3 z-10" 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
              />
            </div>
            
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex absolute inset-0 pointer-events-none items-center justify-between px-10">
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:scale-110"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="pointer-events-auto p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:scale-110"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
