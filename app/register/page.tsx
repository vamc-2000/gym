"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import SubmitButton from "@/components/ui/SubmitButton";
import { GOALS, FITNESS_LEVELS } from "@/lib/constants";
import { authService } from "@/lib/services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    height: "",
    weight: "",
    goal: "",
    fitnessLevel: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setError("");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (!form.goal) newErrors.goal = "Select a goal";
    if (!form.fitnessLevel) newErrors.fitnessLevel = "Select your level";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const res = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        goal: form.goal,
        fitnessLevel: form.fitnessLevel,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setError(res.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-purple-950 via-gray-950 to-black animated-gradient">
      {/* Animated background blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel-purple rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <span className="text-2xl">🏋️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Join GymStreak</h1>
            <p className="text-sm text-white/50">Start your transformation today</p>
          </div>

          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
              <p className="text-sm text-white/50">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                variant="glass"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                error={errors.name}
              />
              <InputField
                label="Email"
                type="email"
                variant="glass"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                error={errors.email}
              />
              <InputField
                label="Password"
                type="password"
                variant="glass"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
              />
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Height (cm)"
                  type="number"
                  variant="glass"
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                />
                <InputField
                  label="Weight (kg)"
                  type="number"
                  variant="glass"
                  value={form.weight}
                  onChange={(e) => update("weight", e.target.value)}
                />
              </div>
              <SelectField
                label="Goal"
                variant="glass"
                value={form.goal}
                onChange={(e) => update("goal", e.target.value)}
                options={GOALS.map((g) => ({ value: g.value, label: `${g.icon} ${g.label}` }))}
                error={errors.goal}
              />
              <SelectField
                label="Fitness Level"
                variant="glass"
                value={form.fitnessLevel}
                onChange={(e) => update("fitnessLevel", e.target.value)}
                options={FITNESS_LEVELS.map((fl) => ({ value: fl.value, label: `${fl.icon} ${fl.label}` }))}
                error={errors.fitnessLevel}
              />

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <SubmitButton
                type="submit"
                loading={loading}
                variant="gradient-purple"
              >
                Create Account
              </SubmitButton>

              <p className="text-center text-sm text-white/40 mt-4">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-auth-accent hover:text-white transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
