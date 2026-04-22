 "use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [workout, setWorkout] = useState<any>([]);
  const [diet, setDiet] = useState<any>([]);

  useEffect(() => {
    fetch("/api/workout")
      .then(res => res.json())
      .then(data => setWorkout(data.weeklyPlan));

    fetch("/api/diet")
      .then(res => res.json())
      .then(data => setDiet(data.meals));
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Workout */}
      <div className="mb-6">
        <h2 className="font-semibold">Workout Plan</h2>
        {workout.map((w: any, i: number) => (
          <p key={i}>{w.day} - {w.focus}</p>
        ))}
      </div>

      {/* Diet */}
      <div>
        <h2 className="font-semibold">Diet Plan</h2>
        {diet.map((d: any, i: number) => (
          <p key={i}>{d.name} - {d.food}</p>
        ))}
      </div>

    </div>
  );
}