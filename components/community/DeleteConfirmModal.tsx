"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  title?: string;
  message?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  title = "Delete Transmission",
  message = "This action is permanent and cannot be reversed. All associated likes, comments, and saved references will be purged from the system.",
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#0a0a12] border border-red-500/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-red-900/10"
      >
        {/* Danger glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/8 rounded-full blur-[80px] pointer-events-none" />

        {/* Content */}
        <div className="relative p-8 text-center space-y-5">
          {/* Warning Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -3, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>

          {/* Message */}
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider leading-relaxed max-w-xs mx-auto">
            {message}
          </p>

          {/* Danger Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/5 border border-red-500/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[7px] font-black text-red-400 uppercase tracking-[0.3em]">
              Irreversible Action
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-3.5 rounded-xl bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {deleting ? "Purging..." : "Delete Forever"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
