export const generateWorkoutPlan = (goal: string) => {
  switch (goal) {
    case "muscle_gain":
      return [
        { day: "Monday", exercises: ["Bench Press", "Push Ups", "Triceps Dips"] },
        { day: "Tuesday", exercises: ["Pull Ups", "Deadlift", "Biceps Curl"] },
        { day: "Wednesday", exercises: ["Squats", "Lunges", "Leg Press"] },
      ];

    case "weight_loss":
      return [
        { day: "Monday", exercises: ["Running", "Jump Rope", "Burpees"] },
        { day: "Tuesday", exercises: ["Cycling", "Mountain Climbers"] },
        { day: "Wednesday", exercises: ["HIIT", "Jump Squats"] },
      ];

    case "strength":
      return [
        { day: "Monday", exercises: ["Deadlift", "Squat", "Bench Press"] },
        { day: "Tuesday", exercises: ["Overhead Press", "Pull Ups"] },
      ];

    default:
      return [
        { day: "Monday", exercises: ["Walking", "Light Jogging"] },
      ];
  }
};