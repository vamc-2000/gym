import mongoose from "mongoose";

const DietSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    goal: String,
    meals: [
      {
        name: String,
        items: [String],
      },
    ],
  },
  { timestamps: true }
);

export const Diet =
  mongoose.models.Diet || mongoose.model("Diet", DietSchema);