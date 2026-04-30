"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import SubmitButton from "@/components/ui/SubmitButton";
import { GOALS, FITNESS_LEVELS } from "@/lib/constants";
import { dashboardService } from "@/lib/services/dashboardService";
import { tokenManager } from "@/lib/auth";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    fitnessLevel: "beginner",
    preferredWorkoutTime: "07:00",
    dndEnabled: false,
  });



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await dashboardService.getProfile();
        if (res.success && res.data) {
          const u = res.data;
          setForm({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            fitnessLevel: u.fitnessLevel || "beginner",
            preferredWorkoutTime: u.notificationSettings?.preferredWorkoutTime || "07:00",
            dndEnabled: u.notificationSettings?.dndEnabled || false,
          });


        }
      } catch {
        const user = tokenManager.getUser();
        if (user) {
          setForm((prev) => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
            fitnessLevel: user.fitnessLevel || "beginner",
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        phone: form.phone,
        fitnessLevel: form.fitnessLevel,
        notificationSettings: {
          preferredWorkoutTime: form.preferredWorkoutTime,
          dndEnabled: form.dndEnabled,
        },
      };

      const res = await dashboardService.updateProfile(payload);
      if (res.success) {
        // Update local user state
        const currentUser = tokenManager.getUser();
        if (currentUser) {
          tokenManager.setUser({
            ...currentUser,
            name: form.name,
            fitnessLevel: form.fitnessLevel as any
          });
        }
        
        // Force refresh for plan regeneration
        localStorage.setItem(`gymstreak_fitness_level_${currentUser?.id}`, form.fitnessLevel);
        localStorage.removeItem(`gymstreak_workout_plan_${currentUser?.id}_${form.fitnessLevel}`);

        setMessage("Profile updated successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage(res.error || "Failed to update");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-40" />
        <div className="bg-dash-card rounded-2xl p-6 border border-white/5 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">👤 Profile</h1>
        <p className="text-white/40 text-sm">Manage your personal information</p>
      </div>

      {/* Basic Info */}
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="text-white font-semibold text-sm mb-4">Account Details</h3>
        <InputField
          label="Full Name"
          variant="dark"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />
        <InputField
          label="Phone Number"
          variant="dark"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="e.g. +1 234 567 890"
        />
        {tokenManager.getUser()?.role === "USER" && (
          <SelectField
            label="Fitness Level"
            variant="dark"
            value={form.fitnessLevel}
            onChange={(e) => update("fitnessLevel", e.target.value)}
            options={[
              { value: "beginner", label: "🟢 Beginner" },
              { value: "intermediate", label: "🟡 Intermediate" },
              { value: "advanced", label: "🔴 Advanced" },
            ]}
          />
        )}
      </div>

      {/* Notification settings */}

      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">Notifications</h3>
        <div className="space-y-4">
          <InputField
            label="Preferred Workout Time"
            type="time"
            variant="dark"
            value={form.preferredWorkoutTime}
            onChange={(e) => update("preferredWorkoutTime", e.target.value)}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Do Not Disturb</p>
              <p className="text-white/30 text-xs">Mute notifications during rest hours</p>
            </div>
            <button
              onClick={() => update("dndEnabled", !form.dndEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                form.dndEnabled ? "bg-neon-blue" : "bg-white/10"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  form.dndEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save */}
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-3 rounded-xl text-sm ${
            message.includes("success")
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message}
        </motion.div>
      )}

      <SubmitButton onClick={handleSave} loading={saving} variant="neon">
        Save Changes
      </SubmitButton>
    </div>
  );
}
