"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import SubmitButton from "@/components/ui/SubmitButton";
import { triggerToast } from "@/components/NotificationManager";

interface FeedbackData {
  id: string;
  rating: number;
  title: string;
  message: string;
  milestoneType: string;
  milestoneValue: string | number;
  createdAt: string;
  updatedAt: string;
}

interface MilestoneFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: { type: string; value: string | number };
  initialData?: FeedbackData | null;
}


export default function MilestoneFeedbackModal({ isOpen, onClose, milestone, initialData }: MilestoneFeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setRating(initialData?.rating || 5);
    setTitle(initialData?.title || "");
    setMessage(initialData?.message || "");
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      triggerToast("Missing Info", "Please share your thoughts in the message field", "info");
      return;
    }

    setSubmitting(true);

    const user = JSON.parse(localStorage.getItem("gymstreak_user") || "{}");
    const userId = user.id || "guest";

    const feedback = {
      id: initialData?.id || `feedback_${Date.now()}`,
      rating,
      title: title || `${milestone.type} Achievement!`,
      message,
      milestoneType: milestone.type,
      milestoneValue: milestone.value,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const storageKey = `gymstreak_user_feedback_${userId}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");

    let updated;
    if (initialData) {
      updated = existing.map((f: FeedbackData) => f.id === initialData.id ? feedback : f);

    } else {
      updated = [feedback, ...existing];
    }

    localStorage.setItem(storageKey, JSON.stringify(updated));

    setTimeout(() => {
      triggerToast("Feedback Submitted", "Thank you for sharing your progress!", "success");
      setSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-dash-card border border-dash-border-subtle rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-neon-yellow/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🎉
              </div>
              <h2 className="text-2xl font-bold text-dash-text mb-1">Milestone Reached!</h2>
              <p className="text-dash-text-dim text-sm">You completed your {milestone.type}: <span className="text-neon-yellow">{milestone.value}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <label className="text-xs text-dash-text-dim font-bold uppercase tracking-widest">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-all ${star <= rating ? "scale-110" : "opacity-30 grayscale"}`}
                    >
                      {star <= rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-dash-text-dim font-bold uppercase tracking-widest ml-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Feeling stronger than ever!"
                    className="w-full bg-dash-text/5 border border-dash-border-subtle rounded-2xl px-5 py-4 text-dash-text outline-none focus:border-neon-yellow transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-dash-text-dim font-bold uppercase tracking-widest ml-1">Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell us about your achievement..."
                    className="w-full bg-dash-text/5 border border-dash-border-subtle rounded-2xl px-5 py-4 text-dash-text outline-none focus:border-neon-yellow transition-all resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-dash-text/5 text-dash-text font-bold rounded-2xl border border-dash-border-subtle hover:bg-dash-text/10 transition-all"
                >
                  Skip
                </button>
                <SubmitButton
                  onClick={() => { }}
                  loading={submitting}
                  variant="neon"
                >
                  {initialData ? "Update Feedback" : "Share Progress"}
                </SubmitButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
