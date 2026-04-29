"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "@/lib/services/dashboardService";

interface Meal {
  name: string;
  items: string[];
  calories?: number;
}

export default function DietPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const res = await dashboardService.getDietPlan();
        if (res.success && res.data?.meals) {
          let parsedMeals: Meal[] = [];
          if (res.data.meals.schedule) {
            // Map the new backend JSON structure
            const schedule = res.data.meals.schedule;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsedMeals = Object.values(schedule).map((m: any) => ({
              name: m.title,
              items: m.items,
              calories: m.macros?.calories
            }));
          } else if (Array.isArray(res.data.meals)) {
            // Fallback for older structure
            parsedMeals = res.data.meals;
          }
          
          if (parsedMeals.length > 0) {
            setMeals(parsedMeals);
          }
        }
      } catch {
        setMeals([
          { name: "Breakfast", items: ["Oatmeal with berries", "Greek yogurt", "Black coffee"], calories: 420 },
          { name: "Mid-Morning Snack", items: ["Protein shake", "Banana", "Almonds (10pcs)"], calories: 280 },
          { name: "Lunch", items: ["Grilled chicken breast", "Brown rice", "Steamed broccoli", "Mixed salad"], calories: 550 },
          { name: "Afternoon Snack", items: ["Apple slices with peanut butter", "Green tea"], calories: 220 },
          { name: "Dinner", items: ["Salmon fillet", "Sweet potato", "Asparagus", "Quinoa"], calories: 580 },
          { name: "Evening", items: ["Casein shake", "Cottage cheese"], calories: 200 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDiet();
  }, []);

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Diet Plan</h1>
          <p className="text-white/40 text-sm">Your daily nutrition schedule</p>
        </div>
        {!loading && (
          <div className="px-4 py-2 bg-neon-green/10 border border-neon-green/20 rounded-xl">
            <p className="text-neon-green text-sm font-semibold">{totalCalories} cal/day</p>
          </div>
        )}
      </div>

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
        <div className="space-y-4">
          {meals.map((meal, i) => (
            <motion.div
              key={meal.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dash-card rounded-2xl p-6 border border-white/5 hover:border-neon-green/20 hover:glow-green transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span className="text-neon-green">🥗</span> {meal.name}
                </h3>
                {meal.calories && (
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full">
                    {meal.calories} cal
                  </span>
                )}
              </div>
              <ul className="space-y-1.5">
                {meal.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
