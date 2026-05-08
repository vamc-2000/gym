"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { chatService } from "@/services/chatService";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { triggerToast } from "@/components/NotificationManager";
import { uploadService } from "@/services/uploadService";

export default function ChatWindow({ friend, currentUserId }: { friend: any, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string, type: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getMessages(friend.id);
      if (res.success) setMessages(res.data || []);
    } catch (e) {}
  }, [friend.id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || loading) return;

    setLoading(true);
    try {
      const res = await chatService.sendMessage(
        friend.id, 
        newMessage, 
        attachment?.url, 
        attachment?.type
      );
      if (res.success) {
        setNewMessage("");
        setAttachment(null);
        setMessages(prev => [...prev, res.data]);
      }
    } finally {
      setLoading(false);
    }
  }, [friend.id, newMessage, attachment, loading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const type = file.type.startsWith("image/") ? "image" : 
                   file.type.startsWith("video/") ? "video" : "none";
      
      const res = await uploadService.uploadFile(file);
      if (res.success) {
        setAttachment({ url: res.url, type });
        triggerToast("Success", `${file.name} uploaded`, "success");
      } else {
        triggerToast("Error", res.error || "Upload failed", "error");
      }
    } catch (err) {
      triggerToast("Error", "Something went wrong during upload", "error");
    } finally {
      setLoading(false);
    }
  };

  const commonEmojis = ["💪", "🔥", "⚡", "🏋️", "🥗", "💯", "🚀", "✨", "🎯", "👟"];

  return (
    <div className="flex flex-col h-full bg-dash-bg/50 rounded-[2rem] border border-dash-border-subtle overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="p-5 bg-dash-card/80 border-b border-dash-border-subtle/50 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-purple-500/20 border border-neon-blue/30 flex items-center justify-center text-neon-blue font-black text-xl shadow-lg shadow-neon-blue/10">
              {friend.name[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-dash-card rounded-full flex items-center justify-center border-2 border-dash-card">
              <span className="w-2.5 h-2.5 bg-neon-green rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black text-dash-text tracking-tight uppercase">{friend.name}</h4>
            <span className="text-[10px] text-neon-green font-bold uppercase tracking-widest opacity-80">
              Active Connection
            </span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="w-10 h-10 rounded-xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-dash-text-dim hover:text-neon-blue hover:border-neon-blue/50 transition-all">📞</button>
           <button className="w-10 h-10 rounded-xl bg-dash-bg border border-dash-border-subtle flex items-center justify-center text-dash-text-dim hover:text-neon-blue hover:border-neon-blue/50 transition-all">📹</button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_center,_rgba(0,245,255,0.03)_0%,_transparent_70%)]"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
            
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
              >
                <div className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-lg bg-dash-card border border-dash-border-subtle flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-neon-blue">
                      {showAvatar ? friend.name[0] : ""}
                    </div>
                  )}
                  <div className={`space-y-1.5 ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                    <div className={`relative p-3 rounded-2xl text-[13px] leading-relaxed shadow-lg transition-all hover:shadow-xl ${
                      isMe 
                        ? "bg-neon-blue text-dash-bg font-bold rounded-tr-none glow-blue-sm" 
                        : "bg-dash-card border border-dash-border-subtle text-dash-text rounded-tl-none"
                    }`}>
                      {msg.mediaUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-w-sm">
                          {msg.mediaType === "image" ? (
                            <img src={msg.mediaUrl} alt="Attachment" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                          ) : msg.mediaType === "video" ? (
                            <video src={msg.mediaUrl} controls className="w-full" />
                          ) : (
                             <div className="p-4 bg-white/5 flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <span className="text-xs truncate">Document Attachment</span>
                             </div>
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <p className="text-[9px] text-dash-text-dim font-bold uppercase tracking-tighter opacity-50 px-1">
                      {format(new Date(msg.createdAt), "hh:mm a")}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30 animate-pulse">
            <div className="w-20 h-20 bg-dash-card rounded-full flex items-center justify-center text-5xl mb-6 shadow-2xl border border-dash-border-subtle">
              🤝
            </div>
            <h3 className="text-lg font-black text-dash-text uppercase tracking-widest mb-2">Secure Link Established</h3>
            <p className="text-xs italic max-w-xs">Begin your briefing with {friend.name}. Your communications are end-to-end encrypted.</p>
          </div>
        )}
      </div>

      {/* Attachment Preview */}
      <AnimatePresence>
        {attachment && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 bg-dash-card border-t border-dash-border-subtle/50 flex items-center gap-4"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-neon-blue/50">
              {attachment.type === "image" ? (
                <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-dash-bg flex items-center justify-center text-2xl">
                  {attachment.type === "video" ? "🎬" : "📄"}
                </div>
              )}
              <button 
                onClick={() => setAttachment(null)}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg text-[8px] hover:bg-red-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-neon-blue uppercase">Attachment Ready</p>
              <p className="text-[8px] text-dash-text-dim">Your media will be sent with your next message</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-6 bg-dash-card/80 border-t border-dash-border-subtle/50 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-dash-bg/50 border border-dash-border-subtle rounded-2xl p-2 focus-within:border-neon-blue/50 transition-all shadow-inner">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,application/pdf"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
            title="Attach file"
          >
            📎
          </button>

          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 bg-dash-card border border-dash-border-subtle rounded-2xl p-3 shadow-2xl flex gap-2 backdrop-blur-xl z-50">
                {commonEmojis.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Input session data..."
            className="flex-1 bg-transparent border-none py-3 text-sm text-dash-text outline-none resize-none max-h-32 min-h-[44px] custom-placeholder placeholder:text-dash-text-dim/40"
            rows={1}
          />

          <button 
            disabled={loading || (!newMessage.trim() && !attachment)}
            className="w-11 h-11 bg-neon-blue text-dash-bg rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] group"
          >
            <span className="text-xl group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">🚀</span>
          </button>
        </form>
      </div>

      <style jsx>{`
        .glow-blue-sm {
          box-shadow: 0 0 15px rgba(0, 245, 255, 0.2);
        }
        .custom-placeholder::placeholder {
           color: rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
