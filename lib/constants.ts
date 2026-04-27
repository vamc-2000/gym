// App-wide constants for GymStreak

export const APP_NAME = "GymStreak";

export const GOALS = [
  { value: "Weight Loss", label: "Weight Loss", icon: "🔥", description: "Burn fat and get lean" },
  { value: "Muscle Gain", label: "Muscle Gain", icon: "💪", description: "Build size and mass" },
  { value: "Strength", label: "Strength", icon: "🏋️", description: "Get stronger overall" },
  { value: "Toning", label: "Toning", icon: "✨", description: "Sculpt and define" },
  { value: "Endurance", label: "Endurance", icon: "🏃", description: "Go longer and harder" },
  { value: "Mobility/Yoga", label: "Mobility/Yoga", icon: "🧘", description: "Flexibility and balance" },
] as const;

export const FITNESS_LEVELS = [
  { value: "Beginner", label: "Beginner", icon: "🌱", description: "New to fitness" },
  { value: "Intermediate", label: "Intermediate", icon: "⚡", description: "Some experience" },
  { value: "Advanced", label: "Advanced", icon: "🔥", description: "Seasoned athlete" },
] as const;

export const UNIT_SYSTEMS = [
  { value: "metric", label: "Metric", description: "cm / kg" },
  { value: "imperial", label: "Imperial", description: "ft, in / lbs" },
] as const;

export type Goal = (typeof GOALS)[number]["value"];
export type FitnessLevel = (typeof FITNESS_LEVELS)[number]["value"];
export type UnitSystem = (typeof UNIT_SYSTEMS)[number]["value"];
