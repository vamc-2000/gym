 import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    weight: Number,
    note: String,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Progress =
  mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);