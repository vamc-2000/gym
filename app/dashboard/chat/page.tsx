"use client";

import { useEffect, useState } from "react";
import { chatService } from "@/services/chatService";
import ChatWindow from "@/components/community/ChatWindow";
import { tokenManager } from "@/lib/auth";

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
    <div className="h-[calc(100vh-160px)] flex gap-6 pb-4 overflow-hidden">
      {/* Sidebar - Friend List */}
      <div className="w-80 bg-dash-card border border-dash-border-subtle rounded-3xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-dash-border-subtle/50">
          <h1 className="text-xl font-black text-dash-text uppercase tracking-tight">Messages</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend)}
              className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-dash-bg/50 border-b border-dash-border-subtle/30 ${selectedFriend?.id === friend.id ? "bg-neon-blue/10 border-l-4 border-l-neon-blue" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-neon-blue font-bold">
                {friend.name[0]}
              </div>
              <div className="text-left flex-1 min-w-0">
                <h4 className="text-sm font-bold text-dash-text truncate">{friend.name}</h4>
                <p className="text-[10px] text-dash-text-dim truncate font-medium uppercase tracking-tighter">Click to chat</p>
              </div>
            </button>
          ))}

          {friends.length === 0 && !loading && (
            <div className="p-10 text-center space-y-4 opacity-40">
               <span className="text-4xl block">💬</span>
               <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest">Add friends to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedFriend ? (
          <ChatWindow friend={selectedFriend} currentUserId={userId} />
        ) : (
          <div className="h-full bg-dash-card/30 border border-dash-border-subtle border-dashed rounded-3xl flex flex-col items-center justify-center text-dash-text-dim gap-6">
            <div className="w-24 h-24 bg-dash-card border border-dash-border-subtle rounded-full flex items-center justify-center text-4xl shadow-2xl">
              📬
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-black text-dash-text uppercase tracking-widest">Your Inbox</h2>
              <p className="text-xs italic">Select a friend to begin your session briefing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
