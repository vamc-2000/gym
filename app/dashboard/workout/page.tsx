"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";
import { useWorkout } from "@/hooks/useWorkout";
import { tokenManager } from "@/lib/auth";
import { UserPlan, WorkoutDay } from "@/types/dashboard";
import { IMAGE_URLS } from "@/config/images";

const getCompletedDays = (completedWorkouts: any[]) => {
  return completedWorkouts?.map((w: any) => w.day) || [];
};

const ExerciseCard = memo(({ ex, lang, speakingId, onSpeak, onStop }: { 
  ex: any; 
  lang: string; 
  speakingId: string | null; 
  onSpeak: (id: string, inst: string[], tLang: "en" | "te") => void;
  onStop: () => void;
}) => {
  const instructions = lang === "te" && ex.instructionsTe ? ex.instructionsTe : ex.instructions;
  return (
    <div className="bg-white/2 p-10 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-all">
      <div className="flex flex-col gap-12">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-10">
            <div>
              <h4 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-neon-blue transition-colors">
                {lang === "te" && ex.nameTe ? ex.nameTe : ex.name}
              </h4>
              <span className="text-[9px] font-black bg-white/5 px-3 py-1.5 rounded-lg text-dash-text-dim uppercase tracking-[0.2em]">{ex.equipment}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-dash-text-dim font-black uppercase tracking-[0.2em] block mb-1 opacity-50">Volume</span>
              <p className="text-xl font-black text-white uppercase">{ex.sets} Sets</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-dash-text-dim font-black uppercase tracking-[0.2em] block mb-1 opacity-50">Target</span>
              <p className="text-xl font-black text-white uppercase">{ex.reps}</p>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-dash-text-dim font-black uppercase tracking-[0.2em] block mb-1 opacity-50">Rest</span>
              <p className="text-xl font-black text-white uppercase">{ex.restTime}</p>
            </div>
          </div>

          <div className="space-y-6 bg-black/20 p-8 rounded-[2rem] border border-white/5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-[0.3em] opacity-50">Execution Steps:</p>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5 mr-2">
                  <button 
                    onClick={() => onSpeak(ex.id, ex.instructions, "en")} 
                    className={`px-3 py-1 text-[8px] font-black rounded-md transition-all cursor-pointer ${lang === "en" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim opacity-50 hover:opacity-100"}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => onSpeak(ex.id, ex.instructionsTe || ex.instructions, "te")} 
                    className={`px-3 py-1 text-[8px] font-black rounded-md transition-all cursor-pointer ${lang === "te" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim opacity-50 hover:opacity-100"}`}
                  >
                    TE
                  </button>
                </div>
                
                <button
                  onClick={() => speakingId === ex.id ? onStop() : onSpeak(ex.id, instructions, lang as "en" | "te")}
                  className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center cursor-pointer ${speakingId === ex.id ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" : "bg-neon-blue/5 border-neon-blue/10 text-neon-blue hover:bg-neon-blue/10"}`}
                >
                  {speakingId === ex.id ? "■" : "▶"}
                </button>
              </div>
            </div>

            <ul className="space-y-4">
              {instructions && instructions.length > 0 ? (
                instructions.map((step: string, j: number) => (
                  <li key={j} className="text-sm text-dash-text-dim flex gap-5">
                    <span className="text-neon-blue font-black text-xs opacity-50">0{j+1}</span>
                    <span className={`leading-relaxed ${lang === "te" ? "font-medium" : ""}`}>{step}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-dash-text-dim opacity-40 italic">Calibration data missing for this sequence.</li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
});

ExerciseCard.displayName = "ExerciseCard";

const Roadmap = memo(({ plan, selectedDay, onDaySelect, getDayStatus }: any) => (
  <div className="relative">
    <div className="flex gap-3 overflow-x-auto pb-6 px-2 custom-scrollbar no-scrollbar">
      {plan.map((day: any) => {
        const status = getDayStatus(day.day);
        const isSelected = selectedDay === day.day;
        return (
          <div
            key={day.day}
            onClick={() => status !== "locked" && onDaySelect(day)}
            className={`flex-shrink-0 w-36 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
              isSelected ? "border-neon-blue bg-neon-blue/10 shadow-lg shadow-neon-blue/10" : 
              status === "active" ? "bg-white/5 border-neon-blue/30" : 
              status === "completed" || status === "completed_today" ? "bg-neon-green/5 border-neon-green/20" : 
              "bg-dash-card/30 border-white/5 opacity-40 grayscale cursor-not-allowed"
            } ${status !== "locked" ? "hover:scale-105 active:scale-95" : ""}`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[9px] font-black uppercase tracking-widest ${status === "active" || isSelected ? "text-neon-blue" : status.startsWith("completed") ? "text-neon-green" : "text-dash-text-dim"}`}>
                Day {day.day}
              </span>
              {status.startsWith("completed") && <span className="text-[10px]">●</span>}
            </div>
            <h4 className="text-[11px] font-black text-white truncate uppercase tracking-tight">{day.title}</h4>
          </div>
        );
      })}
    </div>
  </div>
));

Roadmap.displayName = "Roadmap";

export default function WorkoutPage() {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "te">("en");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

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
        setSelectedDay(plan.currentDay);
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

  const speakInstructions = useCallback((exerciseId: string, instructions: string[], targetLang: "en" | "te") => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        
        const text = (instructions || []).join(". ").trim();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const targetVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        
        if (targetLang === "te") {
          const teVoice = targetVoices.find(v => v.lang.includes("te") || v.lang.includes("telugu"));
          if (teVoice) utterance.voice = teVoice;
          utterance.lang = "te-IN";
        } else {
          const enVoice = targetVoices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
          if (enVoice) utterance.voice = enVoice;
          utterance.lang = "en-US";
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onstart = () => setSpeakingId(exerciseId);
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = (e) => {
          if (e.error !== 'interrupted') {
             console.error("Speech engine error:", e);
          }
          setSpeakingId(null);
        };
        
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Failed to initialize speech:", err);
        setSpeakingId(null);
      }
    }
  }, [voices]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, []);

  const handleDaySelect = useCallback((day: WorkoutDay) => {
    setSelectedDay(day.day);
    setSelectedWorkout(day);
  }, []);

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
      <button onClick={() => router.push('/dashboard/profile')} className="mt-4 px-6 py-2 bg-neon-blue/10 text-neon-blue rounded-full text-sm font-bold cursor-pointer">Update Profile</button>
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
    <div className="space-y-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
        <div>
          <p className="text-neon-blue text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Session Management</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Workout <span className="text-neon-blue">Roadmap</span></h1>
          <div className="flex items-center gap-4 mt-6">
             <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-dash-text-dim uppercase tracking-widest">
              Goal: {userPlan.goal.replace('_', ' ')}
            </span>
            <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5">
              <button onClick={() => setLang("en")} className={`px-3 py-1 text-[9px] font-black rounded-md transition-all ${lang === "en" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim opacity-50 hover:opacity-100"}`}>EN</button>
              <button onClick={() => setLang("te")} className={`px-3 py-1 text-[9px] font-black rounded-md transition-all ${lang === "te" ? "bg-neon-blue text-dash-bg" : "text-dash-text-dim opacity-50 hover:opacity-100"}`}>TE</button>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="flex items-center gap-6 px-6 py-4 bg-white/5 border border-neon-blue/20 rounded-2xl backdrop-blur-md">
             <div className="text-right">
              <span className="text-[9px] uppercase font-black text-neon-blue tracking-[0.2em] opacity-60">Active Session</span>
              <p className="text-3xl font-mono font-black text-white leading-none mt-1 tracking-tighter">{formatTime(seconds)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={isPaused ? resumeTimer : pauseTimer} className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">{isPaused ? "▶" : "||"}</button>
              <button onClick={resetTimer} className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl border border-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all cursor-pointer">■</button>
            </div>
          </div>
        )}
      </div>

      <Roadmap plan={userPlan.workoutPlan} selectedDay={selectedDay} onDaySelect={handleDaySelect} getDayStatus={getDayStatus} />

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
               <div className="glass-panel p-20 rounded-[3rem] border border-white/5 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 text-3xl mb-8">LOCKED</div>
                  <h2 className="text-2xl font-black text-white/20 uppercase tracking-tighter">Session Unavailable</h2>
                  <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-[0.2em] mt-4 opacity-30">Finish current tasks to proceed</p>
               </div>
            ) : selectedWorkout && (
              <div className="glass-panel p-10 rounded-[3rem] border border-white/5">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                        Operational Day {selectedDay} • {selectedWorkout.bodyPartFocus}
                      </span>
                      {getDayStatus(selectedDay).startsWith("completed") && (
                        <span className="bg-neon-green/10 text-neon-green text-[8px] font-black px-2 py-0.5 rounded border border-neon-green/20 uppercase tracking-widest">Finalized</span>
                      )}
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">{selectedWorkout.title}</h2>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-6 rounded-3xl min-w-[340px] backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <span className="text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] block mb-1 opacity-50">
                          {getDayStatus(selectedDay) === "active" ? "Active Timer" : "Est. Duration"}
                        </span>
                        <span className="text-4xl font-mono font-black text-white tracking-tighter">
                          {getDayStatus(selectedDay) === "active" ? formatTime(seconds) : `${selectedWorkout.estimatedDuration}m`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-dash-text-dim uppercase tracking-[0.2em] block mb-1 opacity-50">Energy Exp.</span>
                        <span className="text-2xl font-black text-neon-green uppercase">{selectedWorkout.estimatedCalories}k</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
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
                            className="flex-1 py-4 bg-neon-blue text-dash-bg rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-neon-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                          >
                            Initialize Session
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={isPaused ? resumeTimer : pauseTimer}
                              className="w-14 h-14 bg-white/5 rounded-xl text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center text-xl cursor-pointer"
                            >
                              {isPaused ? "▶" : "||"}
                            </button>
                            <button
                              onClick={handleCompleteWorkout}
                              disabled={loading || seconds < 1}
                              className="flex-1 py-4 bg-neon-green text-dash-bg rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-neon-green/20 hover:shadow-neon-green/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 cursor-pointer"
                            >
                              {loading ? "SAVING SEQUENCE..." : "Complete Workout"}
                            </button>
                          </>
                        )
                      ) : getDayStatus(selectedDay) === "completed_today" ? (
                        <div className="flex flex-col gap-4 flex-1">
                          <div className="py-3 px-4 bg-neon-green/5 border border-neon-green/10 rounded-xl text-center">
                             <p className="text-[9px] font-black text-neon-green uppercase tracking-[0.2em]">Protocol Finalized. Next Deployment in {formatCountdown(countdown)}</p>
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
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/50 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                          >
                            Rerunning Session
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 py-4 bg-neon-green/10 border border-neon-green/20 rounded-xl text-center flex flex-col items-center justify-center">
                           <span className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em] mb-1">Workout Complete</span>
                           <span className="text-[8px] font-black text-neon-green/60 uppercase tracking-widest">Protocol Finalized</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {selectedWorkout.exercises?.map((ex: any) => (
                    <ExerciseCard key={ex.id} ex={ex} lang={lang} speakingId={speakingId} onSpeak={speakInstructions} onStop={stopSpeaking} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

