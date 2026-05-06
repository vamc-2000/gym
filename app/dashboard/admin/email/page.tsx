"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { triggerToast } from "@/components/NotificationManager";
import { format } from "date-fns";

export default function AdminEmailPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    const res = await apiClient<any[]>("/admin/email/logs");
    if (res.success) setLogs(res.data || []);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to send this email to the selected audience?")) return;

    setLoading(true);
    try {
      const res = await apiClient<any>("/admin/email/send-update", {
        method: "POST",
        body: { subject, message, audience }
      });

      if (res.success) {
        triggerToast("Success", `Emails sent! Sent: ${res.data.sentCount}, Failed: ${res.data.failedCount}`, "success");
        setSubject("");
        setMessage("");
        fetchLogs();
      } else {
        triggerToast("Error", res.error || "Failed to send emails", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-dash-text tracking-tight uppercase">Email Command Center</h1>
        <p className="text-dash-text-dim text-sm italic font-medium">Broadcast system updates and announcements to your users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dash-card border border-dash-border-subtle rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-purple-500" />
            
            <form onSubmit={handleSend} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl p-3 text-dash-text text-sm focus:border-neon-blue outline-none"
                  >
                    <option value="ALL">All Users</option>
                    <option value="ADMINS">Admins Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E.g., System Update v2.0"
                    className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl p-3 text-dash-text text-sm focus:border-neon-blue outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest ml-1">Message Content (HTML Supported)</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your announcement details..."
                  className="w-full bg-dash-bg/50 border border-dash-border-subtle rounded-xl p-4 text-dash-text text-sm focus:border-neon-blue outline-none min-h-[300px] font-mono"
                />
              </div>

              <button
                disabled={loading}
                className="w-full py-4 bg-neon-blue text-dash-bg font-black rounded-xl uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-neon-blue/20"
              >
                {loading ? "Broadcasting..." : "🚀 Blast Email Announcement"}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="space-y-6">
           <h2 className="text-xs font-black text-dash-text-dim uppercase tracking-widest flex items-center gap-2">
            <span>📜</span> Broadcast History
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {logs.map((log) => (
              <div key={log.id} className="bg-dash-card border border-dash-border-subtle rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${log.status === "SENT" ? "bg-neon-green/10 text-neon-green border-neon-green/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {log.status}
                  </span>
                  <span className="text-[8px] text-dash-text-dim">{format(new Date(log.createdAt), "MMM dd, HH:mm")}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dash-text truncate">{log.subject}</h4>
                  <p className="text-[10px] text-dash-text-dim uppercase tracking-tighter">To: {log.audience}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] pt-2 border-t border-dash-border-subtle/30">
                  <span className="text-neon-green">Sent: {log.sentCount}</span>
                  <span className="text-red-400">Failed: {log.failedCount}</span>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-center text-[10px] text-dash-text-dim italic py-10">No broadcast logs found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
