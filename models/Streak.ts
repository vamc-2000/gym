import mongoose from "mongoose";

const StreakSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date },
    weeklyCompletion: {
      type: [Boolean], // Array of 7 booleans for the current week
      default: [false, false, false, false, false, false, false],
    },
  },
  { timestamps: true }
);

export const Streak = mongoose.models.Streak || mongoose.model("Streak", StreakSchema);
