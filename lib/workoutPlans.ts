import { WorkoutDay, Exercise } from "@/types/dashboard";

const generatePlan = (baseLevel: "Beginner" | "Intermediate" | "Advanced"): WorkoutDay[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const cycleDay = (i % 7) + 1;

    // Within each level, we still have a slight progression or variation
    let title = "";
    let exercises: Exercise[] = [];

    if (cycleDay === 7) {
      title = "😴 Rest & Recovery";
      exercises = [
        {
          id: `ex-${baseLevel}-${dayNum}-1`,
          name: "Complete Rest",
          sets: 1,
          reps: "Rest Day",
          restTime: "All Day",
          muscleGroup: "Recovery",
          difficulty: baseLevel,
          instructions: ["Rest and recover.", "Hydrate.", "Sleep 8 hours."],
          caloriesBurn: 0
        }
      ];
    } else if (cycleDay === 6) {
      title = "🧘 Active Recovery";
      exercises = [
        {
          id: `ex-${baseLevel}-${dayNum}-1`,
          name: baseLevel === "Advanced" ? "Power Yoga" : "Gentle Stretching",
          sets: 1,
          reps: "20 min",
          restTime: "None",
          muscleGroup: "Flexibility",
          difficulty: baseLevel,
          instructions: ["Focus on breathing.", "Hold each pose."],
          caloriesBurn: 120
        }
      ];
    } else {
      if (baseLevel === "Beginner") {
        title = `🏋️ Beginner Foundation Day ${dayNum}`;
        exercises = [
          { 
            id: `ex-beg-${dayNum}-1`, 
            name: "Bodyweight Squats", 
            nameTe: "బాడీవెయిట్ స్క్వాట్స్",
            sets: 3, 
            reps: "10-12", 
            restTime: "60s", 
            muscleGroup: "Legs", 
            difficulty: "Beginner", 
            instructions: ["Feet shoulder width.", "Back straight."], 
            instructionsTe: ["కాళ్లను భుజాల వెడల్పులో ఉంచండి.", "వీపును తిన్నగా ఉంచండి."],
            caloriesBurn: 50 
          },
          { 
            id: `ex-beg-${dayNum}-2`, 
            name: "Knee Pushups", 
            nameTe: "మోకాళ్ల పుష్-అప్స్",
            sets: 3, 
            reps: "8-10", 
            restTime: "60s", 
            muscleGroup: "Chest", 
            difficulty: "Beginner", 
            instructions: ["On knees.", "Body straight."], 
            instructionsTe: ["మోకాళ్లపై నిలబడండి.", "శరీరాన్ని తిన్నగా ఉంచండి."],
            caloriesBurn: 40 
          },
          { 
            id: `ex-beg-${dayNum}-3`, 
            name: "Bird Dog", 
            nameTe: "బర్డ్ డాగ్",
            sets: 3, 
            reps: "10 each", 
            restTime: "45s", 
            muscleGroup: "Core", 
            difficulty: "Beginner", 
            instructions: ["On all fours.", "Opposite arm/leg."], 
            instructionsTe: ["నాలుగు కాళ్లపై నిలబడండి.", "వ్యతిరేక చేయి మరియు కాలును చాపండి."],
            caloriesBurn: 30 
          }
        ];
      } else if (baseLevel === "Intermediate") {
        title = `💪 Intermediate Power Day ${dayNum}`;
        exercises = [
          { 
            id: `ex-int-${dayNum}-1`, 
            name: "Goblet Squats", 
            nameTe: "గోబ్లెట్ స్క్వాట్స్",
            sets: 4, 
            reps: "12", 
            restTime: "60s", 
            muscleGroup: "Legs", 
            difficulty: "Intermediate", 
            instructions: ["Hold weight at chest.", "Deep squat."], 
            instructionsTe: ["ఛాతీ వద్ద బరువును పట్టుకోండి.", "లోతుగా స్క్వాట్ చేయండి."],
            caloriesBurn: 70 
          },
          { 
            id: `ex-int-${dayNum}-2`, 
            name: "Standard Pushups", 
            nameTe: "స్టాండర్డ్ పుష్-అప్స్",
            sets: 4, 
            reps: "15", 
            restTime: "60s", 
            muscleGroup: "Chest", 
            difficulty: "Intermediate", 
            instructions: ["Hands wide.", "Tight core."], 
            instructionsTe: ["చేతులను వెడల్పుగా ఉంచండి.", "కోర్ బిగించండి."],
            caloriesBurn: 60 
          },
          { 
            id: `ex-int-${dayNum}-3`, 
            name: "Mountain Climbers", 
            nameTe: "మౌంటైన్ క్లైంబర్స్",
            sets: 3, 
            reps: "30s", 
            restTime: "45s", 
            muscleGroup: "Core", 
            difficulty: "Intermediate", 
            instructions: ["High plank.", "Drive knees."], 
            instructionsTe: ["హై ప్లాంక్ స్థితిలో ఉండండి.", "మోకాళ్లను వేగంగా కదిలించండి."],
            caloriesBurn: 80 
          }
        ];
      } else {
        title = `🔥 Advanced Peak Day ${dayNum}`;
        exercises = [
          { 
            id: `ex-adv-${dayNum}-1`, 
            name: "Pistol Squats", 
            nameTe: "పిస్టల్ స్క్వాట్స్",
            sets: 4, 
            reps: "8 each", 
            restTime: "90s", 
            muscleGroup: "Legs", 
            difficulty: "Advanced", 
            instructions: ["Single leg.", "Balance."], 
            instructionsTe: ["ఒంటి కాలుతో స్క్వాట్ చేయండి.", "బ్యాలెన్స్ చేయండి."],
            caloriesBurn: 90 
          },
          { 
            id: `ex-adv-${dayNum}-2`, 
            name: "Diamond Pushups", 
            nameTe: "డైమండ్ పుష్-అప్స్",
            sets: 4, 
            reps: "20", 
            restTime: "60s", 
            muscleGroup: "Chest", 
            difficulty: "Advanced", 
            instructions: ["Hands together.", "Chest to floor."], 
            instructionsTe: ["చేతులను డైమండ్ ఆకారంలో దగ్గరకు చేర్చండి.", "ఛాతీని నేల వరకు దించండి."],
            caloriesBurn: 80 
          },
          { 
            id: `ex-adv-${dayNum}-3`, 
            name: "L-Sit Hold", 
            nameTe: "L-సిట్ హోల్డ్",
            sets: 4, 
            reps: "20s", 
            restTime: "60s", 
            muscleGroup: "Core", 
            difficulty: "Advanced", 
            instructions: ["Raise legs.", "Keep arms straight."], 
            instructionsTe: ["కాళ్లను పైకి లేపండి.", "చేతులను తిన్నగా ఉంచండి."],
            caloriesBurn: 70 
          }
        ];
      }
    }

    return {
      id: `day-${baseLevel}-${dayNum}`,
      day: dayNum,
      title,
      exercises
    };
  });
};

export const WORKOUT_PLANS: Record<string, WorkoutDay[]> = {
  Beginner: generatePlan("Beginner"),
  Intermediate: generatePlan("Intermediate"),
  Advanced: generatePlan("Advanced")
};
