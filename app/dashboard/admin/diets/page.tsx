"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DietFormModal from "./DietFormModal";
import { triggerToast } from "@/components/NotificationManager";

export default function AdminDietsPage() {
  const [diets, setDiets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<any>(null);

  useEffect(() => {
    // Mock fetching diet templates from localStorage or default
    const saved = localStorage.getItem("gymstreak_diet_templates");
    if (saved) {
      setDiets(JSON.parse(saved));
      setLoading(false);
    } else {
      setTimeout(() => {
        const defaultDiets = [
          { id: "1", title: "Keto Advanced", goal: "Weight Loss", calories: 1800, protein: "140g", carbs: "30g", fats: "130g", dietType: "Non-Veg", meals: [] },
          { id: "2", title: "High Protein Bulk", goal: "Muscle Gain", calories: 3200, protein: "200g", carbs: "350g", fats: "90g", dietType: "Non-Veg", meals: [] },
          { id: "3", title: "Vegetarian Balance", goal: "General Fitness", calories: 2200, protein: "100g", carbs: "250g", fats: "70g", dietType: "Veg", meals: [] },
        ];
        setDiets(defaultDiets);
        localStorage.setItem("gymstreak_diet_templates", JSON.stringify(defaultDiets));
        setLoading(false);
      }, 1000);
    }
  }, []);

  const handleSaveDiet = (diet: any) => {
    let updatedDiets;
    if (selectedDiet) {
      updatedDiets = diets.map(d => d.id === diet.id ? diet : d);
      triggerToast("Template Updated", "The diet plan has been updated successfully", "success");
    } else {
      updatedDiets = [diet, ...diets];
      triggerToast("Template Created", "New diet plan has been added to the library", "success");
    }
    setDiets(updatedDiets);
    localStorage.setItem("gymstreak_diet_templates", JSON.stringify(updatedDiets));
  };

  const handleDeleteDiet = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    const updatedDiets = diets.filter(d => d.id !== id);
    setDiets(updatedDiets);
    localStorage.setItem("gymstreak_diet_templates", JSON.stringify(updatedDiets));
    triggerToast("Deleted", "Diet template removed", "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">🥗 Diet Templates</h1>
          <p className="text-white/40 text-sm">Design nutritional plans for different goals</p>
        </div>
        <button 
          onClick={() => { setSelectedDiet(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-neon-yellow text-dash-bg rounded-xl text-sm font-bold shadow-lg shadow-neon-yellow/20 hover:scale-[1.02] transition-all cursor-pointer"
        >
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
              onClick={() => { setSelectedDiet(diet); setIsModalOpen(true); }}
              className="glass-panel p-6 rounded-2xl border border-white/5 group hover:border-white/20 transition-all cursor-pointer relative"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px] font-bold uppercase">{diet.calories} kcal</span>
                <div className="flex gap-2">
                  <span className="text-xl">🥗</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-neon-yellow transition-colors">{diet.title}</h3>
              <p className="text-white/40 text-sm mb-4">{diet.goal}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/30 uppercase font-bold">P: {diet.protein}</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/30 uppercase font-bold">C: {diet.carbs}</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/30 uppercase font-bold">F: {diet.fats}</span>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={(e) => handleDeleteDiet(e, diet.id)}
                  className="text-xs font-bold text-red-400/50 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
                <button className="text-xs font-bold text-neon-yellow hover:underline">Edit Plan</button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <DietFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDiet}
        initialData={selectedDiet}
      />
    </div>
  );
}
