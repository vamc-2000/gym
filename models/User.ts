import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bodyFat: { type: Number }, // percentage
    goal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Strength", "Toning", "Endurance", "Mobility/Yoga"],
    },
    fitnessLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    notificationSettings: {
      preferredWorkoutTime: { type: String, default: "07:00" },
      dndEnabled: { type: Boolean, default: false },
      dndStart: { type: String, default: "22:00" },
      dndEnd: { type: String, default: "06:00" },
    },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);