"use client";

import { useEffect, useState } from "react";
import { friendService } from "@/services/friendService";
import FriendCard from "@/components/community/FriendCard";

export default function FriendsPage() {
  const [data, setData] = useState<any>({ friends: [], pending: [], sent: [], suggested: [] });
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await friendService.getFriendsData();
      if (res.success) setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="space-y-12 pb-24 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-8 border-b border-white/5 pb-8">
        <div>
          <p className="text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Social Intelligence</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Neural <span className="text-neon-blue">Circle</span></h1>
          <p className="text-dash-text-dim text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">
            {data.friends.length} Active Synchronizations
          </p>
        </div>
      </div>

      {/* Pending Requests */}
      {data.pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-black text-neon-green uppercase tracking-widest flex items-center gap-2">
            <span>👋</span> Pending Requests ({data.pending.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pending.map((req: any) => (
              <FriendCard key={req.id} user={req.user} status="PENDING" requestId={req.id} onUpdate={fetchFriends} />
            ))}
          </div>
        </section>
      )}

      {/* Suggested Users */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-neon-blue uppercase tracking-widest flex items-center gap-2">
          <span>✨</span> Suggested Athletes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.suggested.map((user: any) => (
            <FriendCard key={user.id} user={user} status="SUGGESTED" onUpdate={fetchFriends} />
          ))}
          {data.suggested.length === 0 && <p className="text-[10px] text-dash-text-dim italic">No new suggestions at the moment.</p>}
        </div>
      </section>

      {/* My Friends */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <span>🔥</span> My Circle ({data.friends.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.friends.map((f: any) => {
            const user = f.user.id === data.userId ? f.friend : f.user;
            return <FriendCard key={f.id} user={user} status="FRIEND" onUpdate={fetchFriends} />;
          })}
          {data.friends.length === 0 && !loading && (
            <div className="col-span-full py-10 bg-dash-card/30 border border-dash-border-subtle rounded-2xl text-center">
              <p className="text-[10px] text-dash-text-dim uppercase font-bold tracking-widest">You haven't added any friends yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sent Requests */}
      {data.sent.length > 0 && (
        <section className="space-y-4 opacity-70">
          <h2 className="text-xs font-black text-dash-text-dim uppercase tracking-widest flex items-center gap-2">
            <span>✉️</span> Sent Requests ({data.sent.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.sent.map((req: any) => (
              <FriendCard key={req.id} user={req.friend} status="SENT" onUpdate={fetchFriends} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
