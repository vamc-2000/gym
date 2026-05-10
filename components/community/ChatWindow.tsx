"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { chatService } from "@/services/chatService";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { triggerToast } from "@/components/NotificationManager";
import { uploadService } from "@/services/uploadService";

const MessageItem = memo(({ msg, isMe }: { msg: any; isMe: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
  >
    <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
      <div className={`p-4 rounded-3xl text-[13px] leading-relaxed transition-all shadow-xl ${
        isMe 
          ? "bg-neon-blue text-dash-bg font-black rounded-tr-sm glow-blue-sm" 
          : "bg-white/5 border border-white/10 text-white rounded-tl-sm backdrop-blur-md"
      }`}>
        {msg.mediaUrl && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 max-w-sm">
            {msg.mediaType === "image" ? (
              <img src={msg.mediaUrl} alt="Payload" className="w-full h-auto object-cover" />
            ) : msg.mediaType === "video" ? (
              <video src={msg.mediaUrl} controls className="w-full" />
            ) : (
               <div className="p-5 bg-white/5 flex items-center gap-4">
                  <span className="text-xl">📁</span>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">Secure Packet</span>
               </div>
            )}
          </div>
        )}
        <p className="whitespace-pre-wrap">{msg.message}</p>
      </div>
      <p className="text-[8px] font-black text-dash-text-dim uppercase tracking-[0.2em] mt-2 opacity-30 px-2">
        {format(new Date(msg.createdAt), "HH:mm")}
      </p>
    </div>
  </motion.div>
));

MessageItem.displayName = "MessageItem";

export default function ChatWindow({ friend, currentUserId }: { friend: any, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string, type: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getMessages(friend.id);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (e) {}
  }, [friend.id]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
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
    const tempMessage = newMessage;
    const tempAttachment = attachment;
    setNewMessage("");
    setAttachment(null);

    try {
      const res = await chatService.sendMessage(
        friend.id, 
        tempMessage, 
        tempAttachment?.url, 
        tempAttachment?.type
      );
      if (res.success) {
        setMessages(prev => [...prev, res.data]);
      } else {
        setNewMessage(tempMessage);
        setAttachment(tempAttachment);
        triggerToast("Relay Failure", "Data transmission aborted", "error");
      }
    } catch {
       setNewMessage(tempMessage);
       setAttachment(tempAttachment);
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
        triggerToast("Link Ready", "Payload attached to sequence", "success");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dash-bg/30 rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <div className="p-6 bg-white/2 border-b border-white/5 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/10 border border-white/10 flex items-center justify-center text-neon-blue font-black text-xl shadow-lg">
              {friend.name[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-dash-bg rounded-full flex items-center justify-center border-2 border-dash-bg">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-black text-white tracking-[0.2em] uppercase mb-1">{friend.name}</h4>
            <div className="flex items-center gap-2">
               <span className="text-[8px] text-neon-green font-black uppercase tracking-widest opacity-60">Status: Active</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar scroll-smooth"
      >
        {messages.map((msg, index) => (
          <MessageItem key={msg.id || index} msg={msg} isMe={msg.senderId === currentUserId} />
        ))}
        
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 opacity-20">
            <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-5xl border border-white/10">
              🤝
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-3">Secure Connection</h3>
              <p className="text-[9px] font-black uppercase tracking-widest italic max-w-[250px] leading-loose">Channel established. Begin peer-to-peer data relay.</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {attachment && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center gap-6"
          >
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-neon-blue/30 shadow-2xl">
              {attachment.type === "image" ? (
                <img src={attachment.url} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-black/40 flex items-center justify-center text-3xl">
                  {attachment.type === "video" ? "🎬" : "📁"}
                </div>
              )}
              <button 
                onClick={() => setAttachment(null)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-lg text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div>
              <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest mb-1">Payload Ready</p>
              <p className="text-[8px] font-black text-dash-text-dim uppercase tracking-widest opacity-40">Ready for uplink transmission</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8 bg-white/2 border-t border-white/5">
        <form onSubmit={handleSend} className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-[1.5rem] p-2.5 focus-within:border-neon-blue/40 focus-within:bg-black/40 transition-all duration-300">
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
            className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-dash-text-dim hover:text-neon-blue transition-all cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Initialize relay..."
            className="flex-1 bg-transparent border-none py-4 text-[13px] text-white outline-none resize-none max-h-32 min-h-[48px] placeholder:text-white/10 font-medium"
            rows={1}
          />

          <button 
            disabled={loading || (!newMessage.trim() && !attachment)}
            className="w-12 h-12 bg-neon-blue text-dash-bg rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale shadow-xl shadow-neon-blue/20 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}


      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
