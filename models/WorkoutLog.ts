import mongoose from "mongoose";

const WorkoutLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workout: { type: mongoose.Schema.Types.ObjectId, ref: "Workout", required: true },
    date: { type: Date, default: Date.now },
    completed: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model("WorkoutLog", WorkoutLogSchema);
