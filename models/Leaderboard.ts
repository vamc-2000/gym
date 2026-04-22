import mongoose from "mongoose";

const LeaderboardSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Strength", "Toning", "Endurance", "Mobility/Yoga", "Overall"],
      required: true,
    },
    rankings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        score: Number, // Consistency score or streak
        streak: Number,
      },
    ],
    weekStartDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Leaderboard = mongoose.models.Leaderboard || mongoose.model("Leaderboard", LeaderboardSchema);
