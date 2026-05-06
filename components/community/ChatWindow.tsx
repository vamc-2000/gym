"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { chatService } from "@/services/chatService";
import { format } from "date-fns";

export default function ChatWindow({ friend, currentUserId }: { friend: any, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getMessages(friend.id);
      if (res.success) setMessages(res.data || []);
    } catch (e) {}
  }, [friend.id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const res = await chatService.sendMessage(friend.id, newMessage);
      if (res.success) {
        setNewMessage("");
        setMessages(prev => [...prev, res.data]);
      }
    } finally {
      setLoading(false);
    }
  }, [friend.id, newMessage, loading]);

  return (
    <div className="flex flex-col h-full bg-dash-bg/30 rounded-2xl border border-dash-border-subtle overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-dash-card border-b border-dash-border-subtle/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-bold">
          {friend.name[0]}
        </div>
        <div>
          <h4 className="text-sm font-bold text-dash-text">{friend.name}</h4>
          <span className="text-[10px] text-neon-green flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" /> Online
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
                <div className={`p-3 rounded-2xl text-xs ${
                  isMe 
                    ? "bg-neon-blue text-dash-bg font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,245,255,0.2)]" 
                    : "bg-dash-card border border-dash-border-subtle text-dash-text rounded-tl-none"
                }`}>
                  {msg.message}
                </div>
                <p className="text-[8px] text-dash-text-dim px-1 uppercase tracking-tighter">
                  {format(new Date(msg.createdAt), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-dash-text-dim opacity-30 gap-2">
            <span className="text-4xl">👋</span>
            <p className="text-xs italic font-medium">Say hi to {friend.name}!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-dash-card border-t border-dash-border-subtle/50 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-dash-bg/50 border border-dash-border-subtle rounded-xl px-4 py-2.5 text-xs text-dash-text outline-none focus:border-neon-blue transition-all"
        />
        <button 
          disabled={loading || !newMessage.trim()}
          className="p-3 bg-neon-blue text-dash-bg rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          🚀
        </button>
      </form>
    </div>
  );
}
