 export const generateDietPlan = (goal: string) => {
  switch (goal) {
    case "muscle_gain":
      return [
        { name: "Breakfast", items: ["Oats", "Eggs", "Banana"] },
        { name: "Lunch", items: ["Rice", "Chicken", "Vegetables"] },
        { name: "Dinner", items: ["Paneer", "Chapati"] },
      ];

    case "weight_loss":
      return [
        { name: "Breakfast", items: ["Oats", "Apple"] },
        { name: "Lunch", items: ["Brown Rice", "Grilled Chicken"] },
        { name: "Dinner", items: ["Salad", "Soup"] },
      ];

    case "strength":
      return [
        { name: "Breakfast", items: ["Eggs", "Toast", "Milk"] },
        { name: "Lunch", items: ["Rice", "Fish", "Veggies"] },
        { name: "Dinner", items: ["Chicken", "Chapati"] },
      ];

    default:
      return [
        { name: "Breakfast", items: ["Fruits"] },
        { name: "Lunch", items: ["Light Meal"] },
      ];
  }
};