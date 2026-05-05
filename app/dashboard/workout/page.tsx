"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { useWorkout } from "@/context/WorkoutContext";
import { triggerToast } from "@/components/NotificationManager";
import { tokenManager } from "@/lib/auth";

type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  caloriesBurn: number;
  difficulty: string;
  equipment: string;
  instructions: string[];
  instructionsTe?: string[];
};

type WorkoutDay = {
  day: number;
  title: string;
  goal?: string;
  bodyPartFocus?: string;
  estimatedDuration?: number;
  estimatedCalories?: number;
  exercises?: Exercise[];
};

const getCompletedDays = (value: unknown): number[] => {
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    } catch { return []; }
  }
  if (value && typeof value === "object") {
    const maybeObject = value as { days?: unknown; completedDays?: unknown };
    const nested = maybeObject.days ?? maybeObject.completedDays;
    if (Array.isArray(nested)) return nested.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  }
  return [];
};

interface UserPlan {
  id: string;
  goal: string;
  currentDay: number;
  totalDays: number;
  completedDays: number[];
  workoutPlan: WorkoutDay[];
  currentWorkout: WorkoutDay;
  isLockedUntilTomorrow: boolean;
  countdownSeconds: number;
}

export default function WorkoutPage() {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "te">("en");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const {
    seconds,
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  } = useWorkout();

  const fetchUserPlan = useCallback(async () => {
    try {
      const res = await dashboardService.getUserPlan();
      if (res.success && res.data) {
        const plan = res.data as UserPlan;
        setUserPlan(plan);
        // Default to showing current day workout
        setSelectedDay(plan.currentDay);
        // Find current day's workout from plan if possible, otherwise use currentWorkout
        const todayWorkout = plan.workoutPlan.find(d => d.day === plan.currentDay) || plan.currentWorkout;
        setSelectedWorkout(todayWorkout);
        
        if (plan.isLockedUntilTomorrow) {
          setCountdown(plan.countdownSeconds);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user plan", err);
      triggerToast("Error", "Could not load your workout plan", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchUserPlan();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, fetchUserPlan]);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const speakInstructions = (exerciseId: string, instructions: string[]) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = instructions.join(". ");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "en" ? "en-US" : "te-IN";
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeakingId(exerciseId);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  };

  const handleDaySelect = (day: WorkoutDay) => {
    setSelectedDay(day.day);
    setSelectedWorkout(day);
  };

  const handleCompleteWorkout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/workout/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenManager.getAccessToken()}`
        },
        body: JSON.stringify({ workoutId: userPlan?.id })
      });
      const data = await res.json();
      
      if (data.success) {
        triggerToast("Great Job!", "Workout completed! History saved.", "success");
        stopSpeaking();
        resetTimer();
        await fetchUserPlan();
      } else {
        triggerToast("Error", data.error || "Failed to complete workout", "error");
      }
    } catch (err) {
      triggerToast("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userPlan) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      <div className="text-dash-text-dim text-sm font-medium">Synchronizing Plan...</div>
    </div>
  );

  if (!userPlan) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 bg-dash-card border border-dash-border-subtle rounded-3xl p-12 text-center">
      <div className="text-4xl">🧘</div>
      <h2 className="text-xl font-bold text-dash-text">Setup your goal</h2>
      <button onClick={() => window.location.href = '/dashboard/profile'} className="mt-4 px-6 py-2 bg-neon-blue/10 text-neon-blue rounded-full text-sm font-bold">Update Profile</button>
    </div>
  );

  const completedDays = getCompletedDays(userPlan.completedDays);

  const getDayStatus = (dayNum: number) => {
    const isCompleted = completedDays.includes(dayNum);
    const isCurrent = dayNum === userPlan?.currentDay;
    const isFuture = dayNum > (userPlan?.currentDay || 0);

    if (isCurrent && userPlan?.isLockedUntilTomorrow) return "completed_today";
    if (isCompleted) return "completed";
    if (isCurrent) return "active";
    if (isFuture) return "locked";
    return "locked";
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-dash-text mb-2">Workout Roadmap</h1>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-[10px] font-bold text-neon-blue uppercase">
              Goal: {userPlan.goal.replace('_', ' ')}
            </span>
            <div className="flex bg-dash-card border border-dash-border-subtle rounded-lg p-0.5">
              <button onClick={() => setLang("en")} className={`px-3 py-1 text-[10px] font-bold rounded-md ${lang === "en" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim"}`}>EN</button>
              <button onClick={() => setLang("te")} className={`px-3 py-1 text-[10px] font-bold rounded-md ${lang === "te" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim"}`}>TE</button>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="flex items-center gap-6 px-6 py-4 bg-dash-card border border-neon-blue/30 rounded-2xl shadow-xl">
             <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-neon-blue tracking-widest">Active Session</span>
              <span className="text-2xl font-mono font-bold text-dash-text leading-none mt-1">{formatTime(seconds)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={isPaused ? resumeTimer : pauseTimer} className="p-2.5 bg-dash-text/5 rounded-xl">{isPaused ? "▶️" : "⏸️"}</button>
              <button onClick={resetTimer} className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">⏹️</button>
            </div>
          </div>
        )}
      </div>

      {/* 30-Day Roadmap */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 custom-scrollbar no-scrollbar">
          {(userPlan.workoutPlan as WorkoutDay[]).map((day: WorkoutDay) => {
            const status = getDayStatus(day.day);
            const isSelected = selectedDay === day.day;

            return (
              <motion.div
                key={day.day}
                whileHover={status !== "locked" ? { y: -5 } : {}}
                onClick={() => status !== "locked" && handleDaySelect(day)}
                className={`flex-shrink-0 w-40 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected ? "border-neon-blue bg-neon-blue/10 ring-1 ring-neon-blue/50 shadow-[0_0_20px_rgba(0,245,255,0.15)]" : 
                  status === "active" ? "bg-neon-blue/5 border-neon-blue/20" : 
                  status === "completed" || status === "completed_today_waiting" ? "bg-neon-green/5 border-neon-green/20" : 
                  "bg-dash-card border-dash-border-subtle opacity-40 grayscale cursor-not-allowed"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-black uppercase ${status === "active" || isSelected ? "text-neon-blue" : status.startsWith("completed") ? "text-neon-green" : "text-dash-text-dim"}`}>
                    Day {day.day}
                  </span>
                  <span>{status.startsWith("completed") ? "✅" : status === "active" ? "🔓" : "🔒"}</span>
                </div>
                <h4 className="text-xs font-bold text-dash-text truncate mb-1">{day.title}</h4>
                <p className="text-[9px] text-dash-text-dim uppercase tracking-wider">{day.bodyPartFocus}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Workout View Area */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {getDayStatus(selectedDay) === "locked" ? (
               <div className="glass-panel p-12 rounded-3xl border border-dash-border-subtle text-center space-y-6">
                  <div className="text-6xl mb-4 grayscale">🔒</div>
                  <h2 className="text-3xl font-black text-dash-text/40">Day {selectedDay} is Locked</h2>
                  <p className="text-dash-text-dim max-w-md mx-auto italic">Finish your current daily goal to unlock this session.</p>
               </div>
            ) : selectedWorkout && (
              <div className="glass-panel p-8 rounded-3xl border border-neon-blue/30">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-neon-blue text-xs font-bold uppercase tracking-widest">
                        Day {selectedDay} • {selectedWorkout.bodyPartFocus}
                      </span>
                      {getDayStatus(selectedDay).startsWith("completed") && (
                        <span className="bg-neon-green/10 text-neon-green text-[9px] font-black px-2 py-0.5 rounded border border-neon-green/20 uppercase">Completed</span>
                      )}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-dash-text tracking-tight">{selectedWorkout.title}</h2>
                  </div>

                  {/* Actions / Stats Card */}
                  <div className="bg-dash-bg/60 border border-dash-border-subtle p-6 rounded-3xl min-w-[320px]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-tighter">
                          {getDayStatus(selectedDay) === "active" ? "Session Timer" : "Session Stats"}
                        </span>
                        <span className="text-3xl font-mono font-black text-dash-text">
                          {getDayStatus(selectedDay) === "active" ? formatTime(seconds) : `${selectedWorkout.estimatedDuration}m`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="text-right">
                          <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-tighter block">Exercises</span>
                          <span className="text-sm font-bold text-dash-text">{selectedWorkout.exercises?.length || 0}</span>
                        </div>
                        <div className="w-px h-8 bg-dash-border-subtle mx-2 self-center"></div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-tighter block">Burn</span>
                          <span className="text-sm font-bold text-neon-green">{selectedWorkout.estimatedCalories}k</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {getDayStatus(selectedDay) === "active" ? (
                        !isActive ? (
                          <button
                            onClick={async () => {
                              try {
                                await fetch('/api/workout/start', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${tokenManager.getAccessToken()}`
                                  },
                                  body: JSON.stringify({ workoutId: userPlan.id })
                                });
                              } catch (e) {}
                              startTimer(`day-${selectedDay}`);
                            }}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-black font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-yellow-400/40 transition-all"
                          >
                            Start Workout
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={isPaused ? resumeTimer : pauseTimer}
                              className="p-3 bg-white/10 rounded-xl text-white border border-white/20 hover:bg-white/20 transition-all"
                            >
                              {isPaused ? "▶️" : "⏸️"}
                            </button>
                            <button
                              onClick={handleCompleteWorkout}
                              disabled={loading || seconds < 10}
                              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl text-black font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-cyan-400/40 transition-all disabled:opacity-50"
                            >
                              {loading ? "Saving..." : "Finish Workout"}
                            </button>
                          </>
                        )
                      ) : getDayStatus(selectedDay) === "completed_today" ? (
                        <div className="flex flex-col gap-3 flex-1">
                          <div className="flex-1 py-3 px-4 bg-neon-green/10 border border-neon-green/20 rounded-xl text-center flex items-center justify-center gap-2">
                             <span className="text-lg">🔥</span>
                             <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">Day Complete! Next session unlocks in {formatCountdown(countdown)}</span>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await fetch('/api/workout/start', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${tokenManager.getAccessToken()}`
                                  },
                                  body: JSON.stringify({ workoutId: userPlan.id })
                                });
                              } catch (e) {}
                              startTimer(`day-${selectedDay}`);
                            }}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs uppercase hover:bg-white/10 transition-all"
                          >
                            Repeat Workout
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 py-3 px-4 bg-neon-green/10 border border-neon-green/20 rounded-xl text-center flex items-center justify-center gap-2">
                           <span className="text-lg">✅</span>
                           <span className="text-[10px] font-black text-neon-green uppercase tracking-widest">Completed Session</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="grid grid-cols-1 gap-6 mb-4">
                  {selectedWorkout.exercises?.map((ex: any) => {
                    const instructions = lang === "te" && ex.instructionsTe ? ex.instructionsTe : ex.instructions;
                    return (
                      <div key={ex.id} className="bg-dash-bg/30 border border-dash-border-subtle rounded-2xl p-6 group hover:border-neon-blue/30 transition-all">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-xl font-bold text-dash-text group-hover:text-neon-blue transition-colors">{ex.name}</h4>
                                <span className="text-[10px] font-black bg-dash-text/10 px-2 py-1 rounded text-dash-text-dim uppercase">{ex.equipment}</span>
                              </div>
                              <button
                                onClick={() => speakingId === ex.id ? stopSpeaking() : speakInstructions(ex.id, instructions)}
                                className={`p-3 rounded-full border transition-all flex items-center gap-2 ${speakingId === ex.id ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" : "bg-neon-blue/10 border-neon-blue/20 text-neon-blue"}`}
                              >
                                {speakingId === ex.id ? "⏹️" : "🔊"}
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="bg-neon-blue/5 p-3 rounded-xl border border-neon-blue/10">
                                <span className="text-[10px] text-neon-blue font-bold uppercase block mb-1">Sets</span>
                                <p className="text-lg font-black text-dash-text">{ex.sets}</p>
                              </div>
                              <div className="bg-neon-green/5 p-3 rounded-xl border border-neon-green/10">
                                <span className="text-[10px] text-neon-green font-bold uppercase block mb-1">Reps</span>
                                <p className="text-lg font-black text-dash-text">{ex.reps}</p>
                              </div>
                              <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
                                <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">Rest</span>
                                <p className="text-lg font-black text-dash-text">{ex.restTime}</p>
                              </div>
                            </div>

                            <div className="space-y-3 bg-dash-card/50 p-6 rounded-2xl border border-dash-border-subtle">
                              <p className="text-xs font-bold text-dash-text-dim uppercase tracking-widest">Instructions:</p>
                              <ul className="space-y-2">
                                {instructions.map((step: string, j: number) => (
                                  <li key={j} className="text-sm text-dash-text-dim flex gap-3">
                                    <span className="text-neon-blue font-bold min-w-[20px]">0{j+1}</span>
                                    <span className={lang === "te" ? "font-medium" : ""}>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Mobile Completion Bar */}
      {isActive && getDayStatus(selectedDay) === "active" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 bg-dash-bg/80 backdrop-blur-xl border border-neon-green/30 rounded-2xl z-50 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-tighter">Current Session</span>
              <span className="text-xl font-mono font-black text-dash-text">{formatTime(seconds)}</span>
            </div>
            <div className="flex gap-2">
               <button onClick={isPaused ? resumeTimer : pauseTimer} className="p-2 bg-white/5 border border-white/10 rounded-lg">{isPaused ? "▶️" : "⏸️"}</button>
            </div>
          </div>
          <button
            onClick={handleCompleteWorkout}
            disabled={loading || seconds < 10}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-black text-lg shadow-lg shadow-cyan-400/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "SAVING PROGRESS..." : "COMPLETE WORKOUT"}
          </button>
        </div>
      )}
    </div>
  );
}
