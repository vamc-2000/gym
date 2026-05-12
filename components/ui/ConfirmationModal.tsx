"use client";

import { motion, AnimatePresence } from "motion/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info"
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-dash-card border border-dash-border-subtle rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Glow effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full ${
              variant === 'danger' ? 'bg-red-500' : 'bg-neon-blue'
            }`} />

            <div className="relative z-10">
              <h3 className="text-xl font-bold text-dash-text mb-2">{title}</h3>
              <p className="text-dash-text-dim text-sm mb-8 leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl bg-dash-text/5 text-dash-text-dim text-sm font-bold hover:bg-dash-text/10 transition-all cursor-pointer"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-dash-bg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg ${
                    variant === 'danger' 
                      ? 'bg-red-500 shadow-red-500/20' 
                      : 'bg-gradient-to-r from-neon-blue to-cyan-500 shadow-neon-blue/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
