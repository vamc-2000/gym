"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "@/components/dashboard/ChartCard";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import { dashboardService } from "@/lib/services/dashboardService";

interface ProgressEntry {
  date: string;
  weight: number;
  note?: string;
}

export default function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await dashboardService.getProgress();
      if (res.success && res.data) {
        const data = Array.isArray(res.data) ? res.data : res.data.progress || [];
        setEntries(data);
      }
    } catch {
      setEntries([
        { date: "2024-04-01", weight: 82, note: "Starting" },
        { date: "2024-04-08", weight: 81, note: "Feeling good" },
        { date: "2024-04-15", weight: 80.2 },
        { date: "2024-04-22", weight: 79.5, note: "On track" },
        { date: "2024-04-29", weight: 78.8 },
        { date: "2024-05-06", weight: 78, note: "Goal reached!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  const handleAddProgress = async () => {
    if (!weight) return;
    setSubmitting(true);
    try {
      await dashboardService.addProgress({ weight: Number(weight), note: note || undefined });
      setWeight("");
      setNote("");
      fetchProgress();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: e.weight,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Progress</h1>
        <p className="text-white/40 text-sm">Track your weight and body changes</p>
      </div>

      {/* Add progress form */}
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">Log Progress</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <InputField
            label="Weight (kg)"
            type="number"
            variant="dark"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <InputField
            label="Note (optional)"
            variant="dark"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <SubmitButton
            onClick={handleAddProgress}
            loading={submitting}
            variant="neon"
            fullWidth={false}
            className="sm:w-40 shrink-0"
          >
            Add Entry
          </SubmitButton>
        </div>
      </div>

      {/* Weight chart */}
      <ChartCard title="Weight Over Time" subtitle="Your journey" loading={loading}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="date" stroke="#ffffff30" fontSize={12} />
            <YAxis stroke="#ffffff30" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #ffffff10",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#00f5ff"
              strokeWidth={3}
              dot={{ fill: "#00f5ff", r: 4 }}
              activeDot={{ r: 6, fill: "#00f5ff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* History list */}
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">History</h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl">📊</span>
            <p className="text-white/30 text-sm mt-2">No progress logged yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...entries].reverse().map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neon-blue/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⚖️</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{entry.weight} kg</p>
                    {entry.note && <p className="text-white/30 text-xs">{entry.note}</p>}
                  </div>
                </div>
                <span className="text-white/20 text-xs">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
