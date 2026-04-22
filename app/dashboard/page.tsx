"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const [workout, setWorkout] = useState<any>(null);
  const [diet, setDiet] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const w = await API("/workout");
    const d = await API("/diet");
    const p = await API("/progress");

    setWorkout(w.workout);
    setDiet(d.diet);
    setProgress(p.progress || []);
  };
  const addProgress = async () => {
  await API("/progress", "POST", {
    weight: Number(weight),
    note,
  });

  setWeight("");
  setNote("");

  fetchData(); // refresh list
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🏋️ Fitness Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Workout Card */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Workout Plan</h2>

          {workout?.plan?.map((day: any, i: number) => (
            <div key={i} className="mb-3">
              <p className="font-medium">{day.day}</p>
              <ul className="list-disc ml-5 text-sm text-gray-600">
                {day.exercises.map((e: string, idx: number) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Diet Card */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Diet Plan</h2>

          {diet?.meals?.map((meal: any, i: number) => (
            <div key={i} className="mb-3">
              <p className="font-medium">{meal.name}</p>
              <ul className="list-disc ml-5 text-sm text-gray-600">
                {meal.items.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mb-4 flex gap-2">
  <input
    placeholder="Weight"
    value={weight}
    onChange={(e) => setWeight(e.target.value)}
    className="border p-2 rounded"
  />

  <input
    placeholder="Note"
    value={note}
    onChange={(e) => setNote(e.target.value)}
    className="border p-2 rounded"
  />

  <button
    onClick={addProgress}
    className="bg-blue-500 text-white px-4 rounded"
  >
    Add
  </button>
</div>

        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow p-5 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Progress</h2>

          {progress.length === 0 && (
            <p className="text-gray-500">No progress yet</p>
          )}

          {progress.map((p, i) => (
            <div
              key={i}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{new Date(p.date).toLocaleDateString()}</span>
              <span>{p.weight} kg</span>
              <span className="text-gray-500">{p.note}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}