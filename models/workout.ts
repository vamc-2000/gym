import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  duration: { type: String }, // e.g. "30s" or "5 mins"
  instructions: { type: String },
});

const WorkoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    goal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Strength", "Toning", "Endurance", "Mobility/Yoga"],
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    exercises: [ExerciseSchema],
    dayNumber: { type: Number }, // For weekly structure (1-7)
    weekNumber: { type: Number }, // For multi-week programs
  },
  { timestamps: true }
);

export const Workout = mongoose.models.Workout || mongoose.model("Workout", WorkoutSchema);