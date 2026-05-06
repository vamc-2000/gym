"use client";

import { useState } from "react";
import { friendService } from "@/services/friendService";
import { triggerToast } from "@/components/NotificationManager";

interface FriendCardProps {
  user: { id: string; name: string; email?: string };
  status: "SUGGESTED" | "PENDING" | "SENT" | "FRIEND";
  requestId?: string;
  onUpdate: () => void;
}

export default function FriendCard({ user, status, requestId, onUpdate }: FriendCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      let res;
      if (status === "SUGGESTED") {
        res = await friendService.sendRequest(user.id);
      } else if (status === "PENDING" && requestId) {
        res = await friendService.respondToRequest(requestId, "ACCEPTED");
      } else if (status === "FRIEND") {
        if (!confirm(`Remove ${user.name} from friends?`)) return;
        res = await friendService.removeFriend(user.id);
      }

      if (res?.success) {
        triggerToast("Success", "Action completed", "success");
        onUpdate();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const res = await friendService.respondToRequest(requestId, "REJECTED");
      if (res.success) {
        triggerToast("Rejected", "Request declined", "success");
        onUpdate();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dash-card border border-dash-border-subtle rounded-2xl p-4 flex items-center justify-between shadow-md hover:border-neon-blue/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-black text-xl">
          {user.name[0]}
        </div>
        <div>
          <h4 className="text-sm font-bold text-dash-text">{user.name}</h4>
          <p className="text-[10px] text-dash-text-dim">{user.email || "Athlete"}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {status === "PENDING" && (
          <button 
            onClick={handleReject}
            disabled={loading}
            className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold hover:bg-red-500/20 transition-all"
          >
            Decline
          </button>
        )}
        <button
          onClick={handleAction}
          disabled={loading || status === "SENT"}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            status === "SUGGESTED" ? "bg-neon-blue text-dash-bg" :
            status === "PENDING" ? "bg-neon-green text-dash-bg" :
            status === "SENT" ? "bg-dash-bg border border-dash-border-subtle text-dash-text-dim cursor-default" :
            "bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          }`}
        >
          {loading ? "..." : 
           status === "SUGGESTED" ? "Add Friend" :
           status === "PENDING" ? "Accept" :
           status === "SENT" ? "Pending" :
           "Remove"}
        </button>
      </div>
    </div>
  );
}
