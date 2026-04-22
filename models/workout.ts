 import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    goal: String,
    plan: [
      {
        day: String,
        exercises: [String],
      },
    ],
  },
  { timestamps: true }
);

export const Workout =
  mongoose.models.Workout || mongoose.model("Workout", WorkoutSchema);