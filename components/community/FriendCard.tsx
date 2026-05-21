"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { friendService } from "@/services/friendService";
import { triggerToast } from "@/components/NotificationManager";

interface FriendCardProps {
  user: { id: string; name: string; email?: string; avatar?: string };
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
    <div className="bg-black/40 border border-white/5 rounded-[2rem] p-5 flex items-center justify-between group hover:border-neon-blue/30 transition-all backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-blue to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
      
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar
            src={user.avatar}
            name={user.name}
            className="w-14 h-14 rounded-2xl border-2 border-white/5 overflow-hidden bg-dash-card group-hover:border-neon-blue/30 transition-all"
            fallbackSizeClass="text-base font-black uppercase"
          />
          {status === "FRIEND" && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-dash-bg shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-neon-blue transition-colors">{user.name}</h4>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 italic">{user.email?.split('@')[0] || "ATHLETE_NODE"}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {status === "PENDING" && (
          <button 
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 bg-white/5 text-white/40 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
          >
            Refuse
          </button>
        )}
        <button
          onClick={handleAction}
          disabled={loading || status === "SENT"}
          className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg ${
            status === "SUGGESTED" ? "bg-neon-blue text-dash-bg shadow-neon-blue/20 hover:scale-105" :
            status === "PENDING" ? "bg-neon-green text-dash-bg shadow-neon-green/20 hover:scale-105" :
            status === "SENT" ? "bg-white/5 border border-white/10 text-white/20 cursor-default" :
            "bg-white/5 border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
          }`}
        >
          {loading ? "..." : 
           status === "SUGGESTED" ? "Connect" :
           status === "PENDING" ? "Accept" :
           status === "SENT" ? "Pending" :
           "Purge"}
        </button>
      </div>
    </div>
  );
}
