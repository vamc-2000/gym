"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Calendar, Plus, X, Users, ArrowUpRight, Flame, Zap } from "lucide-react";
import { apiClient } from "@/lib/api";
import { triggerToast } from "@/components/NotificationManager";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import SubmitButton from "@/components/ui/SubmitButton";

interface Participant {
  userId: string;
  userName: string;
  progress: number;
  score: number;
  status: string;
}

interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  type: "WORKOUT_COUNT" | "CALORIE_BURN" | "STREAK" | string;
  targetValue: number;
  status: string;
  startDate: string;
  endDate: string;
  isJoined: boolean;
  myProgress: number;
  myStatus: string | null;
  participantCount: number;
  activities: Participant[];
}

export default function ChallengesView() {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeLeaderboard, setActiveLeaderboard] = useState<ChallengeItem | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("WORKOUT_COUNT");
  const [targetValue, setTargetValue] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await apiClient<any>("/challenges");
      if (res.success && res.data) {
        setChallenges(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleJoin = async (id: string) => {
    try {
      const res = await apiClient<any>(`/challenges/${id}/join`, { method: "POST" });
      if (res.success) {
        triggerToast("Transmission successful", "You successfully joined the mission!", "success");
        fetchChallenges();
      } else {
        triggerToast("Failed to join", res.error || "Please try again", "error");
      }
    } catch (e: any) {
      triggerToast("Error", e.message || "Failed to join", "error");
    }
  };

  const handleUpdateProgress = async (id: string, currentVal: number) => {
    const newValStr = prompt("Update your current progress value:", currentVal.toString());
    if (newValStr === null) return;
    const newVal = parseFloat(newValStr);
    if (isNaN(newVal) || newVal < 0) {
      triggerToast("Invalid Input", "Please enter a valid numeric value.", "error");
      return;
    }

    try {
      const res = await apiClient<any>(`/challenges/${id}/progress`, {
        method: "POST",
        body: { progress: newVal }
      });
      if (res.success) {
        triggerToast("Sync Successful", "Your challenge telemetry updated!", "success");
        fetchChallenges();
      } else {
        triggerToast("Failed to update", res.error || "Failed", "error");
      }
    } catch (e: any) {
      triggerToast("Error", e.message || "Failed to update", "error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !targetValue || !endDate) {
      triggerToast("Error", "Please compile all telemetry sectors.", "error");
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient<any>("/challenges", {
        method: "POST",
        body: {
          title,
          description,
          type,
          targetValue: parseFloat(targetValue),
          endDate
        }
      });

      if (res.success) {
        triggerToast("Success", "New Challenge deployed into the grid!", "success");
        setShowCreate(false);
        setTitle("");
        setDescription("");
        setTargetValue("");
        setEndDate("");
        fetchChallenges();
      } else {
        triggerToast("Failed to deploy", res.error || "Please retry", "error");
      }
    } catch (e: any) {
      triggerToast("Error", e.message || "Something went wrong", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-4xl mx-auto">
      {/* Header action */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Global Operations</h2>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-0.5">Deploy, synchronize and conquer challenges</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-neon-blue text-dash-bg font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Deploy Challenge
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 w-full bg-white/5 rounded-3xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white/2 rounded-[2rem] p-20 border border-dashed border-white/10 text-center opacity-50">
          <Trophy className="w-12 h-12 text-neon-blue mx-auto mb-4 animate-pulse" />
          <p className="text-xs font-black text-white uppercase tracking-widest">Sector Inactive</p>
          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">No ongoing campaigns found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {challenges.map((c) => {
            const isCompleted = c.myStatus === "COMPLETED";
            const percent = Math.min(100, Math.round((c.myProgress / c.targetValue) * 100));

            return (
              <div
                key={c.id}
                className={`glass-panel p-6 rounded-3xl border bg-black/20 relative group transition-all duration-300 ${
                  isCompleted 
                    ? "border-neon-green/30 shadow-[0_0_20px_rgba(57,255,20,0.05)]" 
                    : c.isJoined 
                      ? "border-neon-blue/20" 
                      : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white uppercase">{c.title}</span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 border border-neon-green/30 text-neon-green bg-neon-green/10 text-[7px] font-black uppercase tracking-widest rounded-md">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed max-w-xl">{c.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveLeaderboard(c)}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:border-neon-blue/40 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                    >
                      Leaderboard
                    </button>
                    {!c.isJoined ? (
                      <button
                        onClick={() => handleJoin(c.id)}
                        className="px-4 py-2 bg-neon-blue text-dash-bg font-black rounded-xl text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Join Operation
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateProgress(c.id, c.myProgress)}
                        className="px-4 py-2 bg-white/10 border border-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                      >
                        Sync Progress
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar info */}
                {c.isJoined && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                      <span>Telemetry Progress</span>
                      <span className="text-neon-blue">{c.myProgress} / {c.targetValue} ({percent}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className={`h-full rounded-full ${isCompleted ? "bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.4)]" : "bg-neon-blue shadow-[0_0_10px_rgba(0,245,255,0.4)]"}`}
                      />
                    </div>
                  </div>
                )}

                {/* Info footer */}
                <div className="flex items-center gap-6 mt-6 text-[8px] font-black text-white/20 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/20" />
                    <span>Ends {new Date(c.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-white/20" />
                    <span>{c.participantCount} Nodes Participating</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Zap className="w-3.5 h-3.5 text-neon-yellow" />
                    <span className="text-neon-yellow">Reward: 500 XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Create Operation modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#08080c] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-neon-blue" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Deploy New Campaign</h3>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <InputField
                  label="Campaign Name"
                  variant="dark"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Century Shred Ops"
                />

                <InputField
                  label="Operational Objective Details"
                  variant="dark"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the objective parameters..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Objective Category"
                    variant="dark"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    options={[
                      { value: "WORKOUT_COUNT", label: "🏋️ Workout Count" },
                      { value: "CALORIE_BURN", label: "🔥 Calorie Burn" },
                      { value: "STREAK", label: "⚡ Active Streak" },
                    ]}
                  />

                  <InputField
                    label="Target Metric Value"
                    type="number"
                    variant="dark"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="e.g. 10 (Workouts) or 5000 (Kcal)"
                  />
                </div>

                <InputField
                  label="Campaign Expiry (UTC)"
                  type="date"
                  variant="dark"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    Abort
                  </button>
                  <SubmitButton loading={creating} variant="neon">
                    Deploy Grid
                  </SubmitButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating sliding Leaderboard dialog */}
      <AnimatePresence>
        {activeLeaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#08080c] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-neon-yellow animate-bounce" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Operation Leaderboard</h3>
                </div>
                <button
                  onClick={() => setActiveLeaderboard(null)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-xs font-black text-white uppercase tracking-tight">{activeLeaderboard.title}</p>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Objective: {activeLeaderboard.targetValue} {activeLeaderboard.type.replace('_', ' ')}</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                {activeLeaderboard.activities.map((a, idx) => (
                  <div
                    key={a.userId}
                    className="flex items-center justify-between p-3.5 bg-white/2 rounded-2xl border border-white/5 group hover:border-neon-blue/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-white">
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-black text-white uppercase">{a.userName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-neon-blue">{a.progress} / {activeLeaderboard.targetValue}</span>
                  </div>
                ))}
                {activeLeaderboard.activities.length === 0 && (
                  <p className="text-[8px] font-black text-white/20 text-center uppercase py-6">No telemetry signals found</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
