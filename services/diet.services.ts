export interface DietItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  title: string;
  items: DietItem[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface DayPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
  dailyTotal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface CompleteDietPlan {
  veg?: DayPlan;
  non_veg?: DayPlan;
}

const calculateTotalMacros = (items: DietItem[]) => {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
};

const calculateDailyTotal = (meals: { [key: string]: Meal }) => {
  return Object.values(meals).reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalMacros.calories,
      protein: acc.protein + meal.totalMacros.protein,
      carbs: acc.carbs + meal.totalMacros.carbs,
      fats: acc.fats + meal.totalMacros.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
};

export const generateStructuredDietPlan = (
  goal: string,
  preference: "VEG" | "NON_VEG" | "BOTH"
): CompleteDietPlan => {
  const plan: CompleteDietPlan = {};

  if (preference === "VEG" || preference === "BOTH") {
    plan.veg = getPlanForGoal(goal, "VEG");
  }

  if (preference === "NON_VEG" || preference === "BOTH") {
    plan.non_veg = getPlanForGoal(goal, "NON_VEG");
  }

  return plan;
};

const getPlanForGoal = (goal: string, type: "VEG" | "NON_VEG"): DayPlan => {
  // This is a simplified generator. In a real app, this would pull from a database of food items.
  // For now, we'll provide static high-quality data based on the goal.
  
  let breakfast: DietItem[], lunch: DietItem[], dinner: DietItem[], snacks: DietItem[];

  if (goal.toLowerCase().includes("muscle")) {
    // Muscle Gain
    breakfast = type === "VEG" 
      ? [
          { name: "Oats with Milk & Nuts", quantity: "100g oats, 250ml milk", calories: 450, protein: 18, carbs: 60, fats: 15 },
          { name: "Peanut Butter Toast", quantity: "2 slices", calories: 300, protein: 10, carbs: 30, fats: 16 }
        ]
      : [
          { name: "Oats with Milk", quantity: "80g oats, 200ml milk", calories: 350, protein: 12, carbs: 50, fats: 8 },
          { name: "Boiled Eggs", quantity: "3 large", calories: 210, protein: 18, carbs: 1.5, fats: 15 }
        ];
    
    lunch = type === "VEG"
      ? [
          { name: "Paneer Tikka", quantity: "150g", calories: 380, protein: 25, carbs: 8, fats: 28 },
          { name: "Brown Rice & Dal", quantity: "1 bowl each", calories: 400, protein: 15, carbs: 70, fats: 5 }
        ]
      : [
          { name: "Grilled Chicken Breast", quantity: "200g", calories: 330, protein: 60, carbs: 0, fats: 7 },
          { name: "Quinoa / Brown Rice", quantity: "150g", calories: 200, protein: 7, carbs: 40, fats: 3 }
        ];

    dinner = type === "VEG"
      ? [
          { name: "Soya Chunks Curry", quantity: "100g chunks", calories: 340, protein: 50, carbs: 30, fats: 1 },
          { name: "Chapati", quantity: "2 units", calories: 200, protein: 6, carbs: 40, fats: 1 }
        ]
      : [
          { name: "Baked Salmon / Fish", quantity: "200g", calories: 400, protein: 40, carbs: 0, fats: 25 },
          { name: "Stir-fried Veggies", quantity: "150g", calories: 100, protein: 3, carbs: 15, fats: 4 }
        ];

    snacks = [
      { name: "Protein Shake", quantity: "1 scoop", calories: 120, protein: 25, carbs: 3, fats: 1.5 },
      { name: "Mixed Nuts", quantity: "30g", calories: 180, protein: 6, carbs: 6, fats: 16 }
    ];

  } else if (goal.toLowerCase().includes("loss")) {
    // Weight Loss
    breakfast = type === "VEG"
      ? [{ name: "Vegetable Poha", quantity: "150g", calories: 250, protein: 5, carbs: 45, fats: 6 }]
      : [{ name: "Egg White Omelet with Veggies", quantity: "4 whites", calories: 180, protein: 16, carbs: 5, fats: 8 }];
    
    lunch = type === "VEG"
      ? [{ name: "Chickpea Salad", quantity: "200g", calories: 300, protein: 12, carbs: 40, fats: 10 }]
      : [{ name: "Boiled Chicken Salad", quantity: "150g chicken", calories: 250, protein: 35, carbs: 10, fats: 8 }];

    dinner = [{ name: "Mixed Vegetable Soup", quantity: "250ml", calories: 150, protein: 4, carbs: 25, fats: 2 }];
    
    snacks = [{ name: "Green Tea & Apple", quantity: "1 unit", calories: 95, protein: 0.5, carbs: 25, fats: 0 }];

  } else {
    // Strength / Maintenance
    breakfast = [
      { name: "Greek Yogurt with Berries", quantity: "200g", calories: 220, protein: 20, carbs: 20, fats: 5 },
      { name: "Whole Grain Toast", quantity: "1 slice", calories: 100, protein: 4, carbs: 18, fats: 1 }
    ];
    
    lunch = type === "VEG"
      ? [{ name: "Rajma Rice", quantity: "1.5 bowl", calories: 450, protein: 18, carbs: 80, fats: 6 }]
      : [{ name: "Chicken Curry & Rice", quantity: "1.5 bowl", calories: 500, protein: 40, carbs: 70, fats: 12 }];

    dinner = type === "VEG"
      ? [{ name: "Tofu Stir-fry", quantity: "150g tofu", calories: 300, protein: 20, carbs: 10, fats: 18 }]
      : [{ name: "Lean Beef / Turkey", quantity: "150g", calories: 350, protein: 35, carbs: 0, fats: 20 }];

    snacks = [{ name: "Hummus & Carrots", quantity: "50g hummus", calories: 200, protein: 6, carbs: 20, fats: 12 }];
  }

  const meals = {
    breakfast: { title: "Breakfast", items: breakfast, totalMacros: calculateTotalMacros(breakfast) },
    lunch: { title: "Lunch", items: lunch, totalMacros: calculateTotalMacros(lunch) },
    dinner: { title: "Dinner", items: dinner, totalMacros: calculateTotalMacros(dinner) },
    snacks: { title: "Snacks", items: snacks, totalMacros: calculateTotalMacros(snacks) },
  };

  return {
    ...meals,
    dailyTotal: calculateDailyTotal(meals)
  };
};