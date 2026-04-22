import mongoose from "mongoose";

const MealSchema = new mongoose.Schema({
  items: [String],
  calories: { type: Number },
  protein: { type: Number }, // grams
});

const DietPlanSchema = new mongoose.Schema(
  {
    goal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Strength", "Toning", "Endurance", "Mobility/Yoga"],
      required: true,
    },
    bmiRange: {
      min: { type: Number },
      max: { type: Number },
    },
    meals: {
      breakfast: MealSchema,
      lunch: MealSchema,
      dinner: MealSchema,
      snacks: MealSchema,
    },
    totalCalories: { type: Number },
    isIndianFriendly: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DietPlan = mongoose.models.DietPlan || mongoose.model("DietPlan", DietPlanSchema);
