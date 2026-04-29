"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminDietsPage() {
  const [diets, setDiets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching diet templates
    setTimeout(() => {
      setDiets([
        { id: "1", title: "Keto Advanced", goal: "Weight Loss", calories: 1800, protein: "140g" },
        { id: "2", title: "High Protein Bulk", goal: "Muscle Gain", calories: 3200, protein: "200g" },
        { id: "3", title: "Vegetarian Balance", goal: "General Fitness", calories: 2200, protein: "100g" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">🥗 Diet Templates</h1>
          <p className="text-white/40 text-sm">Design nutritional plans for different goals</p>
        </div>
        <button className="px-4 py-2 bg-neon-yellow text-dash-bg rounded-xl text-sm font-bold shadow-lg shadow-neon-yellow/20 hover:scale-[1.02] transition-all cursor-pointer">
          + Create Diet Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)
        ) : (
          diets.map((diet) => (
            <motion.div
              key={diet.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 group hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px] font-bold uppercase">{diet.calories} kcal</span>
                <span className="text-xl">🥗</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-neon-yellow transition-colors">{diet.title}</h3>
              <p className="text-white/40 text-sm mb-4">{diet.goal}</p>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/30">{diet.protein} Protein</span>
                <button className="text-xs font-bold text-neon-yellow hover:underline">Edit</button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
