"use client";

import React from "react";
import { Exercise } from "@/types/dashboard";
import { motion, AnimatePresence } from "framer-motion";
import { translateInstruction } from "@/lib/speechUtils";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
  hideInstructions?: boolean;
}

const MUSCLE_ICONS: Record<string, string> = {
  Legs: "🦵", Chest: "💪", Back: "🏋️", Core: "🔥",
  Arms: "💪", Shoulders: "🏋️", Cardio: "🏃", "Full Body": "⚡",
  Flexibility: "🧘", Recovery: "🌿", Default: "⚡"
};

function getMuscleIcon(muscleGroup: string): string {
  for (const key of Object.keys(MUSCLE_ICONS)) {
    if (muscleGroup.includes(key)) return MUSCLE_ICONS[key];
  }
  return MUSCLE_ICONS.Default;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onEdit,
  onDelete,
  isReadOnly = false,
  hideInstructions = false
}) => {
  const [showTechnique, setShowTechnique] = React.useState(false);
  const [lang, setLang] = React.useState<'en' | 'te'>('en');
  const [speechState, setSpeechState] = React.useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [teVoiceMissing, setTeVoiceMissing] = React.useState(false);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const icon = getMuscleIcon(exercise.muscleGroup);

  React.useEffect(() => {
    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      const hasTe = voices.some(v => v.lang.startsWith('te'));
      if (hasTe) setTeVoiceMissing(false);
    };

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakInstructions = () => {
    if (!window.speechSynthesis) return;

    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('playing');
      return;
    }

    window.speechSynthesis.cancel();
    
    const fullText = exercise.instructions?.map(step => translateInstruction(step, lang)).join(". ") || "";
    
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = lang === 'en' ? 'en-US' : 'te-IN';
    utterance.rate = 0.9; // Slightly slower for clarity
    
    // Check for Telugu voice
    if (lang === 'te') {
      const voices = window.speechSynthesis.getVoices();
      const teVoice = voices.find(v => v.lang.startsWith('te'));
      if (!teVoice) {
        setTeVoiceMissing(true);
        utterance.lang = 'en-US'; // Fallback to English
      } else {
        utterance.voice = teVoice;
        setTeVoiceMissing(false);
      }
    } else {
      setTeVoiceMissing(false);
    }

    utterance.onstart = () => setSpeechState('playing');
    utterance.onend = () => setSpeechState('stopped');
    utterance.onerror = () => setSpeechState('stopped');
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis && speechState === 'playing') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    }
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeechState('stopped');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-dash-bg/50 border border-dash-border-subtle p-6 rounded-3xl hover:border-neon-blue/40 hover:shadow-xl hover:shadow-neon-blue/10 transition-all group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-purple-500/10 flex items-center justify-center text-3xl shadow-lg border border-neon-blue/20"
          >
            {icon}
          </motion.div>
          <div>
            <h4 className="text-white font-black text-lg group-hover:text-neon-blue transition-colors">
              {exercise.name}
            </h4>
            <span className="text-[10px] uppercase tracking-[0.2em] text-dash-text-dim font-black">
              {exercise.muscleGroup} • {exercise.difficulty}
            </span>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(exercise)}
              className="p-2 bg-neon-blue/10 text-neon-blue rounded-xl hover:bg-neon-blue/25 transition-all border border-neon-blue/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(exercise.id)}
              className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/25 transition-all border border-red-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: "Sets", value: exercise.sets },
          { label: "Reps", value: exercise.reps },
          { label: "Rest", value: exercise.restTime },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex-1 min-w-[80px] bg-dash-card/50 px-4 py-3 rounded-2xl border border-dash-border-subtle/50 text-center"
          >
            <p className="text-[9px] text-dash-text-dim uppercase font-black tracking-widest mb-1">{label}</p>
            <p className="text-white font-black text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Instructions section */}
      {!hideInstructions && exercise.instructions && exercise.instructions.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowTechnique(!showTechnique)}
            className="w-full py-3 rounded-xl bg-neon-blue/5 border border-neon-blue/10 flex items-center justify-center gap-2 hover:bg-neon-blue/10 transition-all group/btn"
          >
            <span className={`text-xs transition-transform ${showTechnique ? 'rotate-90' : ''}`}>▶</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-neon-blue group-hover/btn:text-white">
              {showTechnique ? "Hide" : "View"} Instructions
            </span>
          </button>

          <AnimatePresence>
            {showTechnique && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                    <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                      Step-by-Step Guide
                    </p>
                    
                    <div className="flex items-center gap-3">
                      {/* Language Selector */}
                      <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        <button
                          onClick={() => setLang('en')}
                          className={`px-2 py-0.5 rounded text-[8px] font-black transition-all ${lang === 'en' ? 'bg-neon-blue text-black' : 'text-white/40 hover:text-white'}`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setLang('te')}
                          className={`px-2 py-0.5 rounded text-[8px] font-black transition-all ${lang === 'te' ? 'bg-neon-blue text-black' : 'text-white/40 hover:text-white'}`}
                        >
                          TE
                        </button>
                      </div>

                      {/* Speech Controls */}
                      <div className="flex items-center gap-1.5">
                        {speechState === 'playing' ? (
                          <button
                            onClick={pauseSpeech}
                            className="w-7 h-7 flex items-center justify-center bg-neon-yellow/10 text-neon-yellow rounded-lg border border-neon-yellow/20 hover:bg-neon-yellow/20"
                            title="Pause"
                          >
                            ⏸️
                          </button>
                        ) : (
                          <button
                            onClick={speakInstructions}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${speechState === 'paused' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                            title={speechState === 'paused' ? "Resume" : "Play"}
                          >
                            {speechState === 'paused' ? "▶️" : "🔊"}
                          </button>
                        )}
                        
                        {speechState !== 'stopped' && (
                          <button
                            onClick={stopSpeech}
                            className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20"
                            title="Stop"
                          >
                            ⏹️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {teVoiceMissing && lang === 'te' && (
                    <p className="text-[9px] text-neon-yellow font-bold italic mb-2">
                      ⚠️ Telugu voice not available on this device. Falling back to English.
                    </p>
                  )}
                  {exercise.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start group/step">
                      <div className="w-6 h-6 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black text-neon-blue group-hover/step:bg-neon-blue group-hover/step:text-black transition-colors">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-dash-text-muted leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Target Info */}
      {(exercise.weight || exercise.notes) && (
        <div className="mt-6 pt-6 border-t border-dash-border-subtle/20 space-y-3">
          {exercise.weight && (
            <div className="flex items-center gap-3 text-neon-yellow">
              <span className="text-sm">⚖️</span>
              <p className="text-[10px] font-black uppercase tracking-widest">
                Target Load: {exercise.weight}
              </p>
            </div>
          )}
          {exercise.notes && (
            <div className="bg-white/5 p-4 rounded-xl border-l-4 border-neon-blue/30 italic text-xs text-dash-text-dim">
              &quot;{exercise.notes}&quot;
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
