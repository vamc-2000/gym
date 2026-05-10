"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import SubmitButton from "@/components/ui/SubmitButton";

interface DietFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (diet: any) => void;
  initialData?: any;
}

export default function DietFormModal({ isOpen, onClose, onSave, initialData }: DietFormModalProps) {
  const [form, setForm] = useState({
    title: "",
    goal: "Muscle Gain",
    dietType: "Both",
    calories: 2000,
    protein: "150g",
    carbs: "200g",
    fats: "60g",
    meals: [
      { mealName: "Breakfast", time: "08:00", items: [{ name: "", quantity: "" }] }
    ]
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        title: "",
        goal: "Muscle Gain",
        dietType: "Both",
        calories: 2000,
        protein: "150g",
        carbs: "200g",
        fats: "60g",
        meals: [
          { mealName: "Breakfast", time: "08:00", items: [{ name: "", quantity: "" }] }
        ]
      });
    }
  }, [initialData, isOpen]);

  const addMeal = () => {
    setForm({
      ...form,
      meals: [...form.meals, { mealName: "New Meal", time: "12:00", items: [{ name: "", quantity: "" }] }]
    });
  };

  const removeMeal = (index: number) => {
    const newMeals = [...form.meals];
    newMeals.splice(index, 1);
    setForm({ ...form, meals: newMeals });
  };

  const addItem = (mealIndex: number) => {
    const newMeals = [...form.meals];
    newMeals[mealIndex].items.push({ name: "", quantity: "" });
    setForm({ ...form, meals: newMeals });
  };

  const removeItem = (mealIndex: number, itemIndex: number) => {
    const newMeals = [...form.meals];
    newMeals[mealIndex].items.splice(itemIndex, 1);
    setForm({ ...form, meals: newMeals });
  };

  const updateMeal = (index: number, field: string, value: string) => {
    const newMeals = [...form.meals];
    (newMeals[index] as any)[field] = value;
    setForm({ ...form, meals: newMeals });
  };

  const updateItem = (mealIndex: number, itemIndex: number, field: string, value: string) => {
    const newMeals = [...form.meals];
    (newMeals[mealIndex].items[itemIndex] as any)[field] = value;
    setForm({ ...form, meals: newMeals });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: initialData?.id || `diet_${Date.now()}` });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-dash-card border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {initialData ? "Edit Diet Template" : "Create Diet Template"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Plan Title"
                  variant="dark"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. High Protein Bulk"
                  required
                />
                <SelectField
                  label="Target Goal"
                  variant="dark"
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  options={[
                    { value: "Muscle Gain", label: "💪 Muscle Gain" },
                    { value: "Weight Loss", label: "🔥 Weight Loss" },
                    { value: "General Fitness", label: "🏃 General Fitness" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputField
                  label="Calories"
                  type="number"
                  variant="dark"
                  value={String(form.calories)}
                  onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
                />
                <InputField
                  label="Protein"
                  variant="dark"
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })}
                />
                <InputField
                  label="Carbs"
                  variant="dark"
                  value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                />
                <InputField
                  label="Fats"
                  variant="dark"
                  value={form.fats}
                  onChange={(e) => setForm({ ...form, fats: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Meal Schedule</h3>
                  <button
                    type="button"
                    onClick={addMeal}
                    className="text-xs font-bold text-neon-yellow hover:underline"
                  >
                    + Add Meal
                  </button>
                </div>

                {form.meals.map((meal, mIndex) => (
                  <div key={mIndex} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4 relative group">
                    <button
                      type="button"
                      onClick={() => removeMeal(mIndex)}
                      className="absolute top-4 right-4 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      ✕
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Meal Name"
                        variant="dark"
                        value={meal.mealName}
                        onChange={(e) => updateMeal(mIndex, "mealName", e.target.value)}
                      />
                      <InputField
                        label="Time"
                        type="time"
                        variant="dark"
                        value={meal.time}
                        onChange={(e) => updateMeal(mIndex, "time", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-white/40 text-[10px] font-bold uppercase">Items</p>
                        <button
                          type="button"
                          onClick={() => addItem(mIndex)}
                          className="text-[10px] font-bold text-neon-yellow hover:underline"
                        >
                          + Add Item
                        </button>
                      </div>
                      {meal.items.map((item, iIndex) => (
                        <div key={iIndex} className="flex gap-2 items-center">
                          <input
                            placeholder="Item name"
                            className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-neon-yellow"
                            value={item.name}
                            onChange={(e) => updateItem(mIndex, iIndex, "name", e.target.value)}
                          />
                          <input
                            placeholder="Qty"
                            className="w-24 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-neon-yellow"
                            value={item.quantity}
                            onChange={(e) => updateItem(mIndex, iIndex, "quantity", e.target.value)}
                          />
                          {meal.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(mIndex, iIndex)}
                              className="text-white/20 hover:text-red-400 transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <SubmitButton
                  onClick={() => {}}
                  variant="neon"
                >
                  {initialData ? "Save Changes" : "Create Template"}
                </SubmitButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
