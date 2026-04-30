"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";

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
        const [planRes, optionsRes] = await Promise.all([
          dashboardService.getDietPlan(),
          dashboardService.getDietOptions()
        ]);

        if (planRes.success && planRes.data) {
          const planData = planRes.data.meals;
          setRawPlan(planData);
          
          const initialType = planRes.data.dietType === "BOTH" ? "VEG" : (planRes.data.dietType || "VEG");
          setSelectedType(initialType);
          setMeals(extractMealsFromPlan(planData, initialType));
        }

        if (optionsRes.success && optionsRes.data) {
          setOptions(optionsRes.data);
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

  const currentTotalCalories = meals.reduce((sum, m) => sum + (m.totalMacros?.calories || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Diet Plans</h1>
          <p className="text-white/40 text-sm">Explore and preview different nutrition paths</p>
        </div>
        {!loading && (
          <div className="px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-xl">
            <p className="text-neon-green text-sm font-semibold">{currentTotalCalories} kcal/day</p>
          </div>
        )}
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
          {["VEG", "NON_VEG"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedType === type
                  ? "bg-neon-green text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {type === "VEG" ? "🥦 Vegetarian Plan" : "🍗 Non-Vegetarian Plan"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dash-card rounded-2xl p-6 border border-white/5">
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
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-white/40">No items found for this plan type.</p>
            </div>
          )}
          {meals.map((meal, i) => (
            <motion.div
              key={meal.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dash-card rounded-2xl p-6 border border-white/5 hover:border-neon-green/20 hover:glow-green transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="text-neon-green">🍽️</span> {meal.name}
                </h3>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-white/30">Total Calories</p>
                    <p className="text-neon-green font-bold">{meal.totalMacros.calories} kcal</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meal.items.map((item, j) => (
                  <div key={j} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-white font-medium group-hover:text-neon-green transition-colors">{item.name}</h4>
                        <p className="text-xs text-white/40">{item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-white/60 bg-white/10 px-2 py-1 rounded">
                        {item.calories} cal
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/30 uppercase">Protein</span>
                        <span className="text-xs font-medium text-neon-blue">{item.protein}g</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-3">
                        <span className="text-[9px] text-white/30 uppercase">Carbs</span>
                        <span className="text-xs font-medium text-neon-green">{item.carbs}g</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-3">
                        <span className="text-[9px] text-white/30 uppercase">Fats</span>
                        <span className="text-xs font-medium text-orange-400">{item.fats}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex gap-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 items-baseline whitespace-nowrap">
                  <span className="text-xs text-white/40">Protein:</span>
                  <span className="text-sm font-bold text-neon-blue">{meal.totalMacros.protein}g</span>
                </div>
                <div className="flex gap-2 items-baseline whitespace-nowrap">
                  <span className="text-xs text-white/40">Carbs:</span>
                  <span className="text-sm font-bold text-neon-green">{meal.totalMacros.carbs}g</span>
                </div>
                <div className="flex gap-2 items-baseline whitespace-nowrap">
                  <span className="text-xs text-white/40">Fats:</span>
                  <span className="text-sm font-bold text-orange-400">{meal.totalMacros.fats}g</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
