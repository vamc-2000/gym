"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";
import { triggerToast } from "@/components/NotificationManager";


interface DietItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  name: string;
  items: DietItem[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function DietPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [rawPlan, setRawPlan] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("VEG");
  const [loading, setLoading] = useState(true);

  const extractMealsFromPlan = (plan: any, type: string): Meal[] => {
    if (!plan) return [];
    
    // Check if the plan has the new structure (veg/non_veg keys)
    let targetPlan = plan;
    if (plan.veg || plan.non_veg) {
      targetPlan = type === "NON_VEG" ? plan.non_veg : plan.veg;
    }

    if (!targetPlan) return [];

    // The structure can be { breakfast: {...}, lunch: {...}, ... }
    const mealKeys = ["breakfast", "lunch", "dinner", "snacks"];
    return mealKeys
      .filter(key => targetPlan[key])
      .map(key => ({
        name: targetPlan[key].title || key.charAt(0).toUpperCase() + key.slice(1),
        items: targetPlan[key].items || [],
        totalMacros: targetPlan[key].totalMacros || { calories: 0, protein: 0, carbs: 0, fats: 0 }
      }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, optionsRes, profileRes] = await Promise.all([
          dashboardService.getDietPlan(),
          dashboardService.getDietOptions(),
          dashboardService.getProfile()
        ]);

        if (planRes.success && planRes.data) {
          const planData = (planRes.data as any).meals;

          setRawPlan(planData);
          
          const dietData = planRes.data as any;
          let initialType = dietData.dietType === "BOTH" ? "VEG" : (dietData.dietType || "VEG");

          // Override with profile preference if available
          if (profileRes.success && profileRes.data) {
            const pref = (profileRes.data as any).dietPreference || (profileRes.data as any).dietaryPreference;
            if (pref === "VEG") initialType = "VEG";
            else if (pref === "NON_VEG") initialType = "NON_VEG";
            else if (pref === "BOTH") initialType = "VEG";
          }

          setSelectedType(initialType);
          setMeals(extractMealsFromPlan(planData, initialType));
        }

        if (optionsRes.success && optionsRes.data) {
          setOptions(optionsRes.data as any[]);

        }
      } catch (err) {
        console.error("Failed to fetch diet data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    
    // First check if our current assigned plan has this type
    if (rawPlan && (rawPlan[type.toLowerCase()] || (type === "VEG" && rawPlan.breakfast))) {
      setMeals(extractMealsFromPlan(rawPlan, type));
    } else {
      // Otherwise check the alternative options (templates)
      const option = options.find(o => o.type === type);
      if (option?.template) {
        setMeals(extractMealsFromPlan(option.template.meals, type));
      }
    }
  };

  const [completedMeals, setCompletedMeals] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`gymstreak_completed_meals_${today}`);
    if (saved) setCompletedMeals(JSON.parse(saved));
  }, []);

  const toggleMealComplete = (mealName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newCompleted = completedMeals.includes(mealName)
      ? completedMeals.filter(m => m !== mealName)
      : [...completedMeals, mealName];
    
    setCompletedMeals(newCompleted);
    localStorage.setItem(`gymstreak_completed_meals_${today}`, JSON.stringify(newCompleted));
    if (!completedMeals.includes(mealName)) {
      triggerToast("Great!", `You completed ${mealName}`, "success");
    }
  };

  const currentTotalCalories = meals.reduce((sum, m) => sum + (m.totalMacros?.calories || 0), 0);
  const completedCalories = meals
    .filter(m => completedMeals.includes(m.name))
    .reduce((sum, m) => sum + (m.totalMacros?.calories || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dash-text mb-1">Diet Plans</h1>
          <p className="text-dash-text-dim text-sm">Explore and preview different nutrition paths</p>
        </div>
        {!loading && (
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-dash-text/5 border border-dash-border-subtle rounded-xl">
              <p className="text-dash-text-dim text-[10px] uppercase font-bold">Planned</p>
              <p className="text-dash-text text-sm font-semibold">{currentTotalCalories} kcal</p>
            </div>
            <div className="px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-xl">
              <p className="text-neon-green text-[10px] uppercase font-bold">Consumed</p>
              <p className="text-neon-green text-sm font-semibold">{completedCalories} kcal</p>
            </div>
          </div>
        )}
      </div>


      {!loading && (
        <div className="flex flex-wrap gap-2 p-1 bg-dash-text/5 rounded-xl border border-dash-border-subtle w-fit">
          {["VEG", "NON_VEG"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === type
                  ? "bg-neon-green text-black"
                  : "text-dash-text-dim hover:text-dash-text"
              }`}
            >
              {type === "VEG" ? "🥦 Vegetarian" : "🍗 Non-Vegetarian"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
              <div className="skeleton h-5 w-28 mb-3" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {meals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4 bg-dash-text/5 rounded-2xl border border-dashed border-dash-border-subtle">
              <div className="text-4xl">🥗</div>
              <h3 className="text-dash-text font-bold">No plan found for your current level</h3>
              <p className="text-dash-text-dim text-sm max-w-xs">We couldn't find a matching diet plan. Please ensure your goal and level are set correctly in your profile.</p>
              <button 
                onClick={() => window.location.href = '/dashboard/profile'}
                className="px-6 py-2 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 rounded-full text-neon-green text-sm font-bold transition-all"
              >
                Go to Profile
              </button>
            </div>
          )}
          {meals.map((meal, i) => {
            const isMealCompleted = completedMeals.includes(meal.name);
            return (
              <motion.div
                key={meal.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-dash-card rounded-2xl p-6 border transition-all duration-300 ${
                  isMealCompleted 
                    ? "border-neon-green/40 bg-neon-green/5 glow-green" 
                    : "border-dash-border-subtle hover:border-neon-green/20"
                }`}
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-dash-border-subtle">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isMealCompleted ? "text-neon-green" : "text-dash-text"}`}>
                      <span className="text-neon-green">🍽️</span> {meal.name}
                    </h3>
                    {isMealCompleted && (
                      <span className="bg-neon-green text-black text-[9px] font-bold px-2 py-0.5 rounded-full">DONE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <p className="text-[10px] uppercase tracking-wider text-dash-text-dim">Total Calories</p>
                      <p className={`font-bold ${isMealCompleted ? "text-neon-green" : "text-dash-text"}`}>{meal.totalMacros.calories} kcal</p>
                    </div>
                    <button
                      onClick={() => toggleMealComplete(meal.name)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isMealCompleted
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                          : "bg-neon-green text-black hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isMealCompleted ? "Undo" : "Complete Meal"}
                    </button>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meal.items.map((item, j) => (
                  <div key={j} className="bg-dash-text/5 p-4 rounded-xl border border-dash-border-subtle hover:bg-dash-text/10 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-dash-text font-medium group-hover:text-neon-green transition-colors">{item.name}</h4>
                        <p className="text-xs text-dash-text-dim">{item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-dash-text-muted bg-dash-text/10 px-2 py-1 rounded">
                        {item.calories} cal
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-dash-text-dim uppercase">Protein</span>
                        <span className="text-xs font-medium text-neon-blue">{item.protein}g</span>
                      </div>
                      <div className="flex flex-col border-l border-dash-border-subtle pl-3">
                        <span className="text-[9px] text-dash-text-dim uppercase">Carbs</span>
                        <span className="text-xs font-medium text-neon-green">{item.carbs}g</span>
                      </div>
                      <div className="flex flex-col border-l border-dash-border-subtle pl-3">
                        <span className="text-[9px] text-dash-text-dim uppercase">Fats</span>
                        <span className="text-xs font-medium text-orange-400">{item.fats}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-dash-border-subtle flex gap-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 items-baseline whitespace-nowrap">
                  <span className="text-xs text-dash-text-dim">Protein:</span>
                  <span className="text-sm font-bold text-neon-blue">{meal.totalMacros.protein}g</span>
                </div>
                <div className="flex gap-2 items-baseline whitespace-nowrap">
                  <span className="text-xs text-dash-text-dim">Carbs:</span>
                  <span className="text-sm font-bold text-neon-green">{meal.totalMacros.carbs}g</span>
                </div>
                <div className="flex gap-2 items-baseline whitespace-nowrap">
                  <span className="text-xs text-dash-text-dim">Fats:</span>
                  <span className="text-sm font-bold text-orange-400">{meal.totalMacros.fats}g</span>
                </div>
              </div>
            </motion.div>
          );
        })}


        </div>
      )}
    </div>
  );
}
