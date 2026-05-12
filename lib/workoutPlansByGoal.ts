
export type Exercise = {
  id: string;
  name: string;
  bodyPart: string;
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  caloriesBurn: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string;
  instructions: string[];
  instructionsTe?: string[];
  image?: string;
};

export type WorkoutDay = {
  day: number;
  title: string;
  goal: string;
  bodyPartFocus: string;
  estimatedDuration: number;
  estimatedCalories: number;
  exercises: Exercise[];
};

const getLevelMultiplier = (level: string) => {
  switch (level.toLowerCase()) {
    case 'advanced': return { sets: 1.5, reps: 1.2, intensity: 1.3 };
    case 'intermediate': return { sets: 1.2, reps: 1.1, intensity: 1.1 };
    default: return { sets: 1, reps: 1, intensity: 1 };
  }
};

import { IMAGE_URLS } from "@/config/images";

// Comprehensive exercise database with 6-step instructions in EN and TE
const EXERCISE_DB: Record<string, {
  bodyPart: string;
  equipment: string;
  instructions: string[];
  instructionsTe: string[];
  baseCalories: number;
  image?: string;
}> = {
  "Burpees": {
    bodyPart: "Full Body",
    equipment: "Bodyweight",
    instructions: [
      "Step 1: Stand with feet shoulder-width apart.",
      "Step 2: Lower into a squat and place hands on floor.",
      "Step 3: Kick feet back into a push-up position.",
      "Step 4: Perform one push-up with controlled form.",
      "Step 5: Jump feet back to the squat position.",
      "Step 6: Explosively jump up reaching for the sky."
    ],
    instructionsTe: [
      "దశ 1: పాదాలను భుజాల వెడల్పులో ఉంచి నిలబడండి.",
      "దశ 2: స్క్వాట్ స్థితిలోకి వెళ్లి చేతులను నేలపై ఉంచండి.",
      "దశ 3: పుష్-అప్ స్థితిలోకి పాదాలను వెనక్కి నెట్టండి.",
      "దశ 4: నియంత్రిత రూపంతో ఒక పుష్-అప్ చేయండి.",
      "దశ 5: పాదాలను తిరిగి స్క్వాట్ స్థితిలోకి తీసుకురండి.",
      "దశ 6: ఆకాశం వైపు చూస్తూ వేగంగా పైకి దూకండి."
    ],
    baseCalories: 12,
    image: IMAGE_URLS.workouts.pushup
  },
  "Squats": {
    bodyPart: "Legs",
    equipment: "Bodyweight",
    instructions: [
      "Step 1: Stand with feet slightly wider than shoulder-width.",
      "Step 2: Keep your chest up and core engaged.",
      "Step 3: Lower your hips as if sitting in a chair.",
      "Step 4: Ensure knees don't go past toes.",
      "Step 5: Go down until thighs are parallel to floor.",
      "Step 6: Drive through heels to return to start."
    ],
    instructionsTe: [
      "దశ 1: పాదాలను భుజాల వెడల్పు కంటే కొంచెం వెడల్పుగా ఉంచి నిలబడండి.",
      "దశ 2: మీ ఛాతీని పైకి ఉంచి, కోర్ ని నిమగ్నం చేయండి.",
      "దశ 3: కుర్చీలో కూర్చున్నట్లుగా మీ పృష్ఠభాగాలను క్రిందికి దించండి.",
      "దశ 4: మోకాళ్లు కాలివేళ్ల కంటే ముందుకు వెళ్లకుండా చూసుకోండి.",
      "దశ 5: తొడలు నేలకు సమాంతరంగా ఉండే వరకు క్రిందికి వెళ్ళండి.",
      "దశ 6: ప్రారంభ స్థానానికి తిరిగి రావడానికి మడమల ద్వారా పైకి నెట్టండి."
    ],
    baseCalories: 8,
    image: IMAGE_URLS.workouts.squat
  },
  "Pushups": {
    bodyPart: "Chest",
    equipment: "Bodyweight",
    instructions: [
      "Step 1: Start in a high plank position with hands under shoulders.",
      "Step 2: Keep your body in a straight line from head to heels.",
      "Step 3: Lower your body until chest nearly touches the floor.",
      "Step 4: Keep elbows at a 45-degree angle to your body.",
      "Step 5: Push through your palms to return to the top.",
      "Step 6: Fully extend arms without locking elbows."
    ],
    instructionsTe: [
      "దశ 1: భుజాల క్రింద చేతులతో హై ప్లాంక్ స్థితిలో ప్రారంభించండి.",
      "దశ 2: మీ శరీరాన్ని తల నుండి మడమల వరకు నిటారుగా ఉంచండి.",
      "దశ 3: ఛాతీ నేలకు తగిలే వరకు మీ శరీరాన్ని క్రిందికి దించండి.",
      "దశ 4: మోచేతులను మీ శరీరానికి 45 డిగ్రీల కోణంలో ఉంచండి.",
      "దశ 5: పైకి రావడానికి మీ అరచేతుల ద్వారా నెట్టండి.",
      "దశ 6: మోచేతులను లాక్ చేయకుండా చేతులను పూర్తిగా చాచండి."
    ],
    baseCalories: 7,
    image: IMAGE_URLS.workouts.pushup
  },
  "Plank": {
    bodyPart: "Core",
    equipment: "Bodyweight",
    instructions: [
      "Step 1: Place forearms on the floor with elbows under shoulders.",
      "Step 2: Extend legs back, balancing on toes.",
      "Step 3: Keep back flat and hips in line with shoulders.",
      "Step 4: Squeeze your glutes and engage your core.",
      "Step 5: Look down at the floor to keep neck neutral.",
      "Step 6: Hold the position while breathing steadily."
    ],
    instructionsTe: [
      "దశ 1: భుజాల క్రింద మోచేతులతో ముంజేతులను నేలపై ఉంచండి.",
      "దశ 2: కాళ్ళను వెనక్కి చాచి, కాలివేళ్లపై సమతుల్యం చేయండి.",
      "దశ 3: వెనుక భాగాన్ని ఫ్లాట్‌గా ఉంచండి మరియు పృష్ఠభాగాలను భుజాలతో సమానంగా ఉంచండి.",
      "దశ 4: గ్లూట్స్‌ను పిండి వేయండి మరియు మీ కోర్‌ను నిమగ్నం చేయండి.",
      "దశ 5: మెడను తటస్థంగా ఉంచడానికి క్రింద నేల వైపు చూడండి.",
      "దశ 6: స్థిరంగా శ్వాస తీసుకుంటూ అదే స్థితిలో ఉండండి."
    ],
    baseCalories: 5,
    image: IMAGE_URLS.workouts.plank
  },
  "Bench Press": {
    bodyPart: "Chest",
    equipment: "Barbell",
    instructions: [
      "Step 1: Lie flat on a bench with feet firmly on floor.",
      "Step 2: Grip the bar slightly wider than shoulder-width.",
      "Step 3: Unrack the bar and hold it above your mid-chest.",
      "Step 4: Lower the bar slowly until it touches your chest.",
      "Step 5: Pause briefly without resting the weight.",
      "Step 6: Press the bar back up to starting position."
    ],
    instructionsTe: [
      "దశ 1: పాదాలను నేలపై గట్టిగా ఉంచి బెంచ్ మీద ఫ్లాట్‌గా పడుకోండి.",
      "దశ 2: బార్‌ను భుజాల వెడల్పు కంటే కొంచెం వెడల్పుగా పట్టుకోండి.",
      "దశ 3: బార్‌ను అన్‌ర్యాక్ చేసి మీ మధ్య ఛాతీ పైన ఉంచండి.",
      "దశ 4: బార్ మీ ఛాతీని తాకే వరకు మెల్లగా క్రిందికి దించండి.",
      "దశ 5: బరువును విశ్రాంతి తీసుకోకుండా కొద్దిసేపు ఆపండి.",
      "దశ 6: బార్‌ను తిరిగి ప్రారంభ స్థితికి నెట్టండి."
    ],
    baseCalories: 10,
    image: IMAGE_URLS.workouts.benchpress
  },
  "Deadlift": {
    bodyPart: "Back",
    equipment: "Barbell",
    instructions: [
      "Step 1: Stand with feet hip-width apart, bar over mid-foot.",
      "Step 2: Bend at hips to grip the bar outside your knees.",
      "Step 3: Keep your back flat and shins touching the bar.",
      "Step 4: Drive through legs to lift the bar up.",
      "Step 5: Pull bar close to body until standing upright.",
      "Step 6: Lower the bar under control to the floor."
    ],
    instructionsTe: [
      "దశ 1: పాదాలను హిప్-వెడల్పులో ఉంచి నిలబడండి, బార్ మిడ్-ఫుట్ పైన ఉండాలి.",
      "దశ 2: మీ మోకాళ్ల వెలుపల బార్‌ను పట్టుకోవడానికి హిప్స్ దగ్గర వంగండి.",
      "దశ 3: మీ వెన్నుముకను ఫ్లాట్‌గా ఉంచండి మరియు షిన్స్ బార్‌ను తాకాలి.",
      "దశ 4: బార్‌ను పైకి లేపడానికి కాళ్ళ ద్వారా నెట్టండి.",
      "దశ 5: నిటారుగా నిలబడే వరకు బార్‌ను శరీరానికి దగ్గరగా లాగండి.",
      "దశ 6: నియంత్రణలో బార్‌ను తిరిగి నేలపై దించండి."
    ],
    baseCalories: 15,
    image: IMAGE_URLS.workouts.deadlift
  },
  "Mountain Climbers": {
    bodyPart: "Core",
    equipment: "Bodyweight",
    instructions: [
      "Step 1: Start in a high plank position with hands under shoulders.",
      "Step 2: Keep your core tight and back flat.",
      "Step 3: Drive your right knee toward your chest.",
      "Step 4: Switch legs quickly, bringing left knee forward.",
      "Step 5: Keep hips low and avoid bouncing.",
      "Step 6: Continue alternating legs at a fast pace."
    ],
    instructionsTe: [
      "దశ 1: భుజాల క్రింద చేతులతో హై ప్లాంక్ స్థితిలో ప్రారంభించండి.",
      "దశ 2: మీ కోర్‌ను గట్టిగా మరియు వెనుక భాగాన్ని ఫ్లాట్‌గా ఉంచండి.",
      "దశ 3: మీ కుడి మోకాలిని మీ ఛాతీ వైపుకు నడపండి.",
      "దశ 4: కాళ్ళను త్వరగా మార్చండి, ఎడమ మోకాలిని ముందుకు తీసుకురండి.",
      "దశ 5: పృష్ఠభాగాలను తక్కువగా ఉంచండి మరియు ఎగరడం మానుకోండి.",
      "దశ 6: వేగంగా కాళ్ళను మారుస్తూ కొనసాగించండి."
    ],
    baseCalories: 9,
    image: IMAGE_URLS.workouts.plank
  },
  "Jumping Jacks": {
    bodyPart: "Full Body",
    equipment: "Bodyweight",
    instructions: [
      "Step 1: Stand upright with arms at your sides.",
      "Step 2: Jump and spread your legs past shoulder-width.",
      "Step 3: Simultaneously clap your hands above your head.",
      "Step 4: Jump again to return to the start position.",
      "Step 5: Lower your arms back to your sides.",
      "Step 6: Maintain a steady rhythm throughout."
    ],
    instructionsTe: [
      "దశ 1: మీ పక్కల చేతులతో నిటారుగా నిలబడండి.",
      "దశ 2: దూకి మీ కాళ్ళను భుజాల వెడల్పు కంటే వెడల్పుగా చాచండి.",
      "దశ 3: ఏకకాలంలో మీ తల పైన మీ చేతులతో చప్పట్లు కొట్టండి.",
      "దశ 4: ప్రారంభ స్థానానికి తిరిగి రావడానికి మళ్ళీ దూకండి.",
      "దశ 5: మీ చేతులను తిరిగి మీ పక్కలకు దించండి.",
      "దశ 6: అంతటా స్థిరమైన లయను కొనసాగించండి."
    ],
    baseCalories: 6,
    image: IMAGE_URLS.workouts.squat
  }
};

const createExercise = (
  name: string,
  sets: number,
  reps: string,
  restTime: string,
  difficulty: "beginner" | "intermediate" | "advanced",
  weekNum: number
): Exercise => {
  const dbData = EXERCISE_DB[name] || {
    bodyPart: "Full Body",
    equipment: "Bodyweight",
    instructions: [`Step 1-6 for ${name}`],
    instructionsTe: [`దశ 1-6 ${name} కోసం`],
    baseCalories: 10
  };

  return {
    id: `ex-${name.replace(/\s+/g, '-')}-${weekNum}`,
    name: weekNum > 1 ? `${name} (Variation ${weekNum})` : name,
    bodyPart: dbData.bodyPart,
    sets: sets + (weekNum - 1),
    reps: reps,
    restTime: restTime,
    caloriesBurn: dbData.baseCalories + (weekNum * 2),
    difficulty: difficulty,
    equipment: dbData.equipment,
    instructions: dbData.instructions,
    instructionsTe: dbData.instructionsTe,
    image: dbData.image
  };
};

const generate30DayPlan = (goal: string, weeklySplit: { title: string; focus: string; exercises: any[] }[]) => {
  const plan: WorkoutDay[] = [];
  for (let d = 1; d <= 30; d++) {
    const weekNum = Math.ceil(d / 7);
    const dayOfWeek = (d - 1) % 7;
    const split = weeklySplit[dayOfWeek];
    
    const exercises = split.exercises.map((ex) => 
      createExercise(ex.name, ex.sets, ex.reps, ex.restTime, ex.difficulty, weekNum)
    );

    plan.push({
      day: d,
      title: weekNum > 1 ? `${split.title} Variation` : split.title,
      goal: goal,
      bodyPartFocus: split.focus,
      estimatedDuration: 45 + (weekNum * 5),
      estimatedCalories: exercises.reduce((sum, e) => sum + e.caloriesBurn, 0) * (parseInt(exercises[0]?.reps) || 1),
      exercises
    });
  }
  return plan;
};

const FAT_LOSS_SPLIT = [
  { title: "HIIT + Core", focus: "Full Body", exercises: [
    { name: "Burpees", sets: 3, reps: "15", restTime: "30s", difficulty: "intermediate" },
    { name: "Mountain Climbers", sets: 3, reps: "30", restTime: "30s", difficulty: "beginner" }
  ]},
  { title: "Full Body Circuit", focus: "Full Body", exercises: [
    { name: "Jumping Jacks", sets: 4, reps: "50", restTime: "20s", difficulty: "beginner" },
    { name: "Pushups", sets: 3, reps: "15", restTime: "30s", difficulty: "intermediate" }
  ]},
  { title: "Cardio + Abs", focus: "Core", exercises: [
    { name: "Plank", sets: 3, reps: "60", restTime: "45s", difficulty: "beginner" },
    { name: "Mountain Climbers", sets: 3, reps: "30", restTime: "30s", difficulty: "intermediate" }
  ]},
  { title: "Lower Body Burn", focus: "Legs", exercises: [
    { name: "Squats", sets: 4, reps: "20", restTime: "45s", difficulty: "beginner" },
    { name: "Burpees", sets: 2, reps: "10", restTime: "60s", difficulty: "intermediate" }
  ]},
  { title: "Upper Body Conditioning", focus: "Upper Body", exercises: [
    { name: "Pushups", sets: 4, reps: "15", restTime: "60s", difficulty: "intermediate" },
    { name: "Plank", sets: 3, reps: "45", restTime: "30s", difficulty: "beginner" }
  ]},
  { title: "Long Cardio + Mobility", focus: "Full Body", exercises: [
    { name: "Jumping Jacks", sets: 5, reps: "60", restTime: "20s", difficulty: "intermediate" },
    { name: "Squats", sets: 3, reps: "15", restTime: "30s", difficulty: "beginner" }
  ]},
  { title: "Active Recovery", focus: "Rest", exercises: [] }
];

const MUSCLE_GAIN_SPLIT = [
  { title: "Chest + Triceps", focus: "Chest", exercises: [
    { name: "Bench Press", sets: 4, reps: "10", restTime: "90s", difficulty: "intermediate" },
    { name: "Pushups", sets: 3, reps: "15", restTime: "60s", difficulty: "beginner" }
  ]},
  { title: "Back + Biceps", focus: "Back", exercises: [
    { name: "Deadlift", sets: 4, reps: "8", restTime: "120s", difficulty: "advanced" },
    { name: "Plank", sets: 3, reps: "60", restTime: "60s", difficulty: "intermediate" }
  ]},
  { title: "Legs", focus: "Legs", exercises: [
    { name: "Squats", sets: 4, reps: "12", restTime: "90s", difficulty: "intermediate" },
    { name: "Burpees", sets: 2, reps: "10", restTime: "90s", difficulty: "intermediate" }
  ]},
  { title: "Shoulders + Abs", focus: "Shoulders", exercises: [
    { name: "Pushups", sets: 4, reps: "12", restTime: "90s", difficulty: "intermediate" },
    { name: "Plank", sets: 3, reps: "60", restTime: "45s", difficulty: "beginner" }
  ]},
  { title: "Arms + Core", focus: "Arms", exercises: [
    { name: "Mountain Climbers", sets: 4, reps: "30", restTime: "60s", difficulty: "beginner" },
    { name: "Plank", sets: 4, reps: "45", restTime: "30s", difficulty: "intermediate" }
  ]},
  { title: "Full Body Strength", focus: "Full Body", exercises: [
    { name: "Deadlift", sets: 3, reps: "5", restTime: "180s", difficulty: "advanced" },
    { name: "Bench Press", sets: 3, reps: "5", restTime: "180s", difficulty: "advanced" }
  ]},
  { title: "Recovery + Mobility", focus: "Rest", exercises: [] }
];

export const WORKOUT_PLANS_BY_GOAL: Record<string, WorkoutDay[]> = {
  weight_loss: generate30DayPlan("weight_loss", FAT_LOSS_SPLIT),
  fat_loss: generate30DayPlan("fat_loss", FAT_LOSS_SPLIT),
  body_cutting: generate30DayPlan("body_cutting", FAT_LOSS_SPLIT),
  muscle_gain: generate30DayPlan("muscle_gain", MUSCLE_GAIN_SPLIT),
  bulking: generate30DayPlan("bulking", MUSCLE_GAIN_SPLIT),
  lean_muscle: generate30DayPlan("lean_muscle", MUSCLE_GAIN_SPLIT),
  strength_building: generate30DayPlan("strength_building", MUSCLE_GAIN_SPLIT),
  general_fitness: generate30DayPlan("general_fitness", FAT_LOSS_SPLIT),
  endurance: generate30DayPlan("endurance", FAT_LOSS_SPLIT),
  stamina: generate30DayPlan("stamina", FAT_LOSS_SPLIT),
};

export const adjustPlanForLevel = (plan: WorkoutDay[], level: string): WorkoutDay[] => {
  const mult = getLevelMultiplier(level);
  return plan.map(day => ({
    ...day,
    exercises: day.exercises.map(ex => ({
      ...ex,
      sets: Math.round(ex.sets * mult.sets),
      reps: typeof ex.reps === 'string' && ex.reps.includes('s') 
        ? `${Math.round(parseInt(ex.reps) * mult.intensity)}s` 
        : String(Math.round(parseInt(ex.reps) * mult.reps)),
      caloriesBurn: Math.round(ex.caloriesBurn * mult.intensity)
    }))
  }));
};
