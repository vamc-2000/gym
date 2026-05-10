"use client";

import { useEffect, useState } from "react";
import { chatService } from "@/services/chatService";
import ChatWindow from "@/components/community/ChatWindow";
import { tokenManager } from "@/lib/auth";
import { motion } from "motion/react";

export default function ChatPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchChatData = async () => {
    try {
      const res = await chatService.getChatFriends();
      if (res.success) setFriends(res.data || []);
      
      const user = tokenManager.getUser();
      if (user) setUserId(user.id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 pb-4 overflow-hidden relative">
      {/* Sidebar - Friend List */}
      <div className="w-80 bg-dash-card/50 backdrop-blur-xl border border-dash-border-subtle rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-dash-border-subtle/50">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Briefings</h1>
          <div className="relative">
             <input 
               type="text" 
               placeholder="Search contacts..." 
               className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl py-2 px-4 text-[11px] text-dash-text outline-none focus:border-neon-blue transition-all"
             />
             <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`w-full p-5 flex items-center gap-4 transition-all hover:bg-white/5 border-b border-dash-border-subtle/30 relative group ${selectedFriend?.id === friend.id ? "bg-neon-blue/10" : ""}`}
            >
              {selectedFriend?.id === friend.id && (
                <motion.div layoutId="active-chat" className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_10px_rgba(0,245,255,1)]" />
              )}
              <div className="w-12 h-12 rounded-xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-neon-blue font-black text-lg relative shadow-inner">
                {friend.name[0].toUpperCase()}
                {friend.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-blue text-dash-bg text-[9px] font-black rounded-full flex items-center justify-center border-2 border-dash-card shadow-lg">
                    {friend.unreadCount > 9 ? "9+" : friend.unreadCount}
                  </span>
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <h4 className={`text-sm font-black truncate tracking-tight uppercase ${friend.unreadCount > 0 ? "text-white" : "text-dash-text/80"}`}>{friend.name}</h4>
                <p className={`text-[10px] truncate font-bold uppercase tracking-widest ${friend.unreadCount > 0 ? "text-neon-blue animate-pulse" : "text-dash-text-dim/60"}`}>
                  {friend.unreadCount > 0 ? `${friend.unreadCount} new packets` : "Awaiting data"}
                </p>
              </div>
            </button>
          ))}

          {friends.length === 0 && !loading && (
            <div className="p-10 text-center space-y-6 opacity-30 mt-10">
               <div className="w-16 h-16 bg-dash-bg border border-dash-border-subtle rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">💬</div>
               <p className="text-[10px] font-black text-dash-text uppercase tracking-[0.2em] leading-loose">Establish network connections with other athletes to begin data exchange.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0">
        {selectedFriend ? (
          <ChatWindow friend={selectedFriend} currentUserId={userId} />
        ) : (
          <div className="h-full bg-dash-card/20 backdrop-blur-sm border border-dash-border-subtle/50 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-dash-text-dim gap-8 group">
            <div className="relative">
              <div className="w-32 h-32 bg-dash-card/50 border border-dash-border-subtle rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                📬
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-neon-blue/10 border border-neon-blue/30 rounded-full flex items-center justify-center animate-bounce">
                 <span className="text-xl">✨</span>
              </div>
            </div>
            <div className="text-center space-y-3 px-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Communication Hub</h2>
              <p className="text-[11px] font-bold text-dash-text-dim uppercase tracking-[0.3em] max-w-sm leading-relaxed">Select a verified connection from the left terminal to initialize high-speed data transfer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
