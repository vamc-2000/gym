"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MoreHorizontal, Pencil, Trash2, Share2, Link2,
  Bookmark, Flag, X,
} from "lucide-react";

interface PostActionMenuProps {
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  onSave: () => void;
  onReport?: () => void;
}

export default function PostActionMenu({
  isOwner,
  onEdit,
  onDelete,
  onShare,
  onCopyLink,
  onSave,
  onReport,
}: PostActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const items = [
    ...(isOwner
      ? [
          { icon: Pencil, label: "Edit", action: onEdit, color: "text-neon-blue" },
          { icon: Trash2, label: "Delete", action: onDelete, color: "text-red-500" },
        ]
      : []),
    { icon: Share2, label: "Share", action: onShare, color: "text-white/60" },
    { icon: Link2, label: "Copy Link", action: onCopyLink, color: "text-white/60" },
    { icon: Bookmark, label: "Save", action: onSave, color: "text-white/60" },
    ...(!isOwner
      ? [{ icon: Flag, label: "Report", action: onReport || (() => {}), color: "text-red-400" }]
      : []),
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg hover:bg-white/5 text-white/30 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        aria-label="Post actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-48 bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {items.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => {
                  setOpen(false);
                  item.action();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer ${item.color} ${
                  idx < items.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
