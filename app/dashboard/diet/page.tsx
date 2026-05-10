const MealCard = memo(({ meal, isMealCompleted, onToggle }: { 
  meal: Meal; 
  isMealCompleted: boolean; 
  onToggle: (name: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-dash-card rounded-[2rem] p-8 border transition-all duration-300 ${isMealCompleted
          ? "border-neon-green/40 bg-neon-green/5 glow-green"
          : "border-white/5 hover:border-neon-green/20"
        }`}
    >
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isMealCompleted ? 'bg-neon-green/20' : 'bg-white/5'}`}>
            🍽️
          </div>
          <div>
            <h3 className={`font-black text-xl uppercase tracking-tighter flex items-center gap-3 ${isMealCompleted ? "text-neon-green" : "text-white"}`}>
              {meal.name}
            </h3>
            {isMealCompleted && (
              <span className="text-[9px] font-black text-neon-green uppercase tracking-[0.2em] opacity-60">Session Finalized</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-dash-text-dim opacity-50 mb-1">Target Energy</p>
            <p className={`font-black text-lg ${isMealCompleted ? "text-neon-green" : "text-white"}`}>{meal.totalMacros.calories} kcal</p>
          </div>
          <button
            onClick={() => onToggle(meal.name)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isMealCompleted
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                : "bg-neon-green text-black hover:scale-105 active:scale-95"
              }`}
          >
            {isMealCompleted ? "Reopen" : "Consume Meal"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meal.items.map((item, j) => (
          <div key={j} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-black uppercase tracking-tight text-sm group-hover:text-neon-green transition-colors">{item.name}</h4>
                <p className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest opacity-50 mt-1">{item.quantity}</p>
              </div>
              <span className="text-[10px] font-black text-dash-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                {item.calories} CAL
              </span>
            </div>
            <div className="flex gap-4 mt-6">
              <div className="flex flex-col">
                <span className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40">Prot</span>
                <span className="text-xs font-black text-neon-blue uppercase">{item.protein}g</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40">Carb</span>
                <span className="text-xs font-black text-neon-green uppercase">{item.carbs}g</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[8px] text-dash-text-dim font-black uppercase tracking-widest opacity-40">Fats</span>
                <span className="text-xs font-black text-orange-400 uppercase">{item.fats}g</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex gap-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 items-baseline whitespace-nowrap">
          <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest opacity-40">Protein:</span>
          <span className="text-sm font-black text-neon-blue uppercase">{meal.totalMacros.protein}g</span>
        </div>
        <div className="flex gap-2 items-baseline whitespace-nowrap">
          <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest opacity-40">Carbs:</span>
          <span className="text-sm font-black text-neon-green uppercase">{meal.totalMacros.carbs}g</span>
        </div>
        <div className="flex gap-2 items-baseline whitespace-nowrap">
          <span className="text-[10px] font-black text-dash-text-dim uppercase tracking-widest opacity-40">Fats:</span>
          <span className="text-sm font-black text-orange-400 uppercase">{meal.totalMacros.fats}g</span>
        </div>
      </div>
    </motion.div>
  );
});

MealCard.displayName = "MealCard";

export default function DietPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [rawPlan, setRawPlan] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("VEG");
  const [loading, setLoading] = useState(true);
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);

  const extractMealsFromPlan = (plan: any, type: string): Meal[] => {
    if (!plan) return [];
    const mealKeys = ["breakfast", "lunch", "dinner", "snacks"];
    if (type === "BOTH" && (plan.veg || plan.non_veg)) {
      return mealKeys.map(key => {
        const vegMeal = plan.veg?.[key];
        const nonVegMeal = plan.non_veg?.[key];
        const combinedItems = [
          ...(vegMeal?.items?.map((item: any) => ({ ...item, name: `🥦 ${item.name}` })) || []),
          ...(nonVegMeal?.items?.map((item: any) => ({ ...item, name: `🍗 ${item.name}` })) || [])
        ];
        return {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          items: combinedItems,
          totalMacros: {
            calories: Math.max(vegMeal?.totalMacros?.calories || 0, nonVegMeal?.totalMacros?.calories || 0),
            protein: Math.max(vegMeal?.totalMacros?.protein || 0, nonVegMeal?.totalMacros?.protein || 0),
            carbs: Math.max(vegMeal?.totalMacros?.carbs || 0, nonVegMeal?.totalMacros?.carbs || 0),
            fats: Math.max(vegMeal?.totalMacros?.fats || 0, nonVegMeal?.totalMacros?.fats || 0),
          }
        };
      });
    }
    let targetPlan = plan;
    if (plan.schedule) {
      targetPlan = plan.schedule;
    } else if (plan.veg || plan.non_veg) {
      targetPlan = type === "NON_VEG" ? plan.non_veg : plan.veg;
    }
    if (!targetPlan) return [];
    return mealKeys
      .filter(key => targetPlan[key])
      .map(key => {
        const mealData = targetPlan[key];
        return {
          name: mealData.title || key.charAt(0).toUpperCase() + key.slice(1),
          items: Array.isArray(mealData.items) 
            ? mealData.items.map((it: any) => 
                typeof it === 'string' ? { name: it, quantity: "", calories: 0, protein: 0, carbs: 0, fats: 0 } : it
              ) 
            : [],
          totalMacros: mealData.totalMacros || mealData.macros || { calories: 0, protein: 0, carbs: 0, fats: 0 }
        };
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, optionsRes, profileRes] = await Promise.all([
          dashboardService.getDietPlan(),
          dashboardService.getDietOptions(),
          dashboardService.getProfile()
        ]);
        if (planRes.success && planRes.data) {
          const planData = (planRes.data as any).meals;
          setRawPlan(planData);
          const dietData = planRes.data as any;
          let initialType = dietData.dietType || "VEG";
          if (profileRes.success && profileRes.data) {
            const pref = (profileRes.data as any).dietPreference || (profileRes.data as any).dietaryPreference;
            if (pref) initialType = pref;
          }
          setSelectedType(initialType);
          setMeals(extractMealsFromPlan(planData, initialType));
        }
        if (optionsRes.success && optionsRes.data) {
          setOptions(optionsRes.data as any[]);
        }
      } catch (err) {
        console.error("Failed to fetch diet data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`gymstreak_completed_meals_${today}`);
    if (saved) setCompletedMeals(JSON.parse(saved));
  }, []);

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type);
    if (rawPlan && (rawPlan[type.toLowerCase()] || (type === "VEG" && rawPlan.breakfast))) {
      setMeals(extractMealsFromPlan(rawPlan, type));
    } else {
      const option = options.find(o => o.type === type);
      if (option?.template) {
        setMeals(extractMealsFromPlan(option.template.meals, type));
      }
    }
  }, [rawPlan, options]);

  const toggleMealComplete = useCallback((mealName: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCompletedMeals(prev => {
      const isCompleted = prev.includes(mealName);
      const newCompleted = isCompleted
        ? prev.filter(m => m !== mealName)
        : [...prev, mealName];
      localStorage.setItem(`gymstreak_completed_meals_${today}`, JSON.stringify(newCompleted));
      if (!isCompleted) {
        triggerToast("Great!", `You completed ${mealName}`, "success");
      }
      return newCompleted;
    });
  }, []);

  const currentTotalCalories = useMemo(() => meals.reduce((sum, m) => sum + (m.totalMacros?.calories || 0), 0), [meals]);
  const completedCalories = useMemo(() => meals
    .filter(m => completedMeals.includes(m.name))
    .reduce((sum, m) => sum + (m.totalMacros?.calories || 0), 0), [meals, completedMeals]);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-8 border-b border-white/5 pb-8">
        <div>
          <p className="text-neon-green text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Nutritional Strategy</p>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Diet <span className="text-neon-green">Protocol</span></h1>
        </div>
        {!loading && (
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
              <p className="text-dash-text-dim text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-50">Operational Goal</p>
              <p className="text-white font-black text-xl tracking-tighter">{currentTotalCalories} KCAL</p>
            </div>
            <div className="px-6 py-3 bg-neon-green/10 border border-neon-green/20 rounded-2xl backdrop-blur-sm">
              <p className="text-neon-green text-[9px] uppercase font-black tracking-[0.2em] mb-1 opacity-50">Net Consumption</p>
              <p className="text-neon-green font-black text-xl tracking-tighter">{completedCalories} KCAL</p>
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/5 w-fit">
          {["VEG", "NON_VEG", "BOTH"].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${selectedType === type
                  ? "bg-neon-green text-black shadow-lg shadow-neon-green/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
            >
              {type === "VEG" ? "Vegetarian" : type === "NON_VEG" ? "Non-Vegetarian" : "Hybrid Plan"}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/2 rounded-[2.5rem] h-64 w-full animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {meals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-6 bg-white/2 rounded-[3rem] border border-dashed border-white/10">
              <div className="text-5xl opacity-20">🥗</div>
              <h3 className="text-white font-black uppercase tracking-tighter text-xl">Mission Objective Missing</h3>
              <p className="text-dash-text-dim text-[10px] font-black uppercase tracking-widest opacity-40 max-w-xs leading-loose">Verify profile parameters to initialize nutrition protocol.</p>
              <button
                onClick={() => router.push('/dashboard/profile')}
                className="px-8 py-3 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 rounded-xl text-neon-green text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Sync Profile
              </button>
            </div>
          )}
          {meals.map((meal) => (
            <MealCard key={meal.name} meal={meal} isMealCompleted={completedMeals.includes(meal.name)} onToggle={toggleMealComplete} />
          ))}
        </div>
      )}
    </div>
  );
}

