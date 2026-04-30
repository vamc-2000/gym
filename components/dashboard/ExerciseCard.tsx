"use client";

import React from "react";
import { Exercise } from "@/types/dashboard";
import { motion } from "framer-motion";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onEdit, 
  onDelete,
  isReadOnly = false
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-dash-bg/40 border border-dash-border-subtle p-4 rounded-xl hover:border-neon-blue/30 transition-all group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-white font-bold text-sm group-hover:text-neon-blue transition-colors">
            {exercise.name}
          </h4>
          <span className="text-[10px] uppercase tracking-wider text-dash-text-dim font-bold">
            {exercise.muscleGroup} • {exercise.difficulty}
          </span>
        </div>
        
        {!isReadOnly && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(exercise)}
              className="p-1.5 bg-neon-blue/10 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-all"
              title="Edit Exercise"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete(exercise.id)}
              className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
              title="Delete Exercise"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-dash-card/50 p-2 rounded-lg border border-dash-border-subtle/50 text-center">
          <p className="text-[9px] text-dash-text-dim uppercase font-bold mb-0.5">Sets</p>
          <p className="text-white font-bold text-xs">{exercise.sets}</p>
        </div>
        <div className="bg-dash-card/50 p-2 rounded-lg border border-dash-border-subtle/50 text-center">
          <p className="text-[9px] text-dash-text-dim uppercase font-bold mb-0.5">Reps</p>
          <p className="text-white font-bold text-xs">{exercise.reps}</p>
        </div>
        <div className="bg-dash-card/50 p-2 rounded-lg border border-dash-border-subtle/50 text-center">
          <p className="text-[9px] text-dash-text-dim uppercase font-bold mb-0.5">Rest</p>
          <p className="text-white font-bold text-xs">{exercise.restTime}</p>
        </div>
      </div>
      
      {(exercise.weight || exercise.notes) && (
        <div className="mt-3 pt-3 border-t border-dash-border-subtle/30 space-y-1">
          {exercise.weight && (
            <p className="text-[11px] text-neon-yellow">
              <span className="font-bold">Target Weight:</span> {exercise.weight}
            </p>
          )}
          {exercise.notes && (
            <p className="text-[11px] text-dash-text-muted italic">
              "{exercise.notes}"
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};
