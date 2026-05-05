"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/ui/ProgressBar";
import SelectionCard from "@/components/ui/SelectionCard";
import InputField from "@/components/ui/InputField";
import SubmitButton from "@/components/ui/SubmitButton";
import { GOALS, FITNESS_LEVELS, UNIT_SYSTEMS } from "@/lib/constants";
import { authService } from "@/lib/services/authService";

interface OnboardingData {
  name: string;
  goal: string;
  fitnessLevel: string;
  units: string;
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weightKg: string;
  weightLbs: string;
  targetWeightKg: string;
  targetWeightLbs: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const TOTAL_STEPS = 9;

const stepVariants = {
  enter: { opacity: 0, scale: 0.95, y: 20 },
  center: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<OnboardingData>({
    name: "",
    goal: "",
    fitnessLevel: "",
    units: "metric",
    heightCm: "",
    heightFt: "",
    heightIn: "",
    weightKg: "",
    weightLbs: "",
    targetWeightKg: "",
    targetWeightLbs: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const update = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setError("");
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.name.trim()) newErrors.name = "Please enter your name";
        break;
      case 2:
        if (!data.goal) newErrors.goal = "Please select a goal";
        break;
      case 3:
        if (!data.fitnessLevel) newErrors.fitnessLevel = "Please select your level";
        break;
      case 5:
        if (data.units === "metric") {
          if (!data.heightCm) newErrors.heightCm = "Enter your height";
          if (!data.weightKg) newErrors.weightKg = "Enter your weight";
        } else {
          if (!data.heightFt) newErrors.heightFt = "Enter feet";
          if (!data.weightLbs) newErrors.weightLbs = "Enter your weight";
        }
        break;
      case 6:
        if (data.units === "metric") {
          if (!data.targetWeightKg) newErrors.targetWeightKg = "Enter target weight";
        } else {
          if (!data.targetWeightLbs) newErrors.targetWeightLbs = "Enter target weight";
        }
        break;
      case 7:
        if (!data.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email";
        if (!data.password) newErrors.password = "Password is required";
        else if (data.password.length < 6) newErrors.password = "Minimum 6 characters";
        if (data.password !== data.confirmPassword)
          newErrors.confirmPassword = "Passwords don't match";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!data.name.trim();
      case 2: return !!data.goal;
      case 3: return !!data.fitnessLevel;
      case 4: return !!data.units;
      case 5:
        return data.units === "metric"
          ? !!data.heightCm && !!data.weightKg
          : !!data.heightFt && !!data.weightLbs;
      case 6:
        return data.units === "metric" ? !!data.targetWeightKg : !!data.targetWeightLbs;
      case 7:
        return !!data.email && !!data.password && !!data.confirmPassword;
      default: return true;
    }
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    const height =
      data.units === "metric"
        ? Number(data.heightCm)
        : Math.round(Number(data.heightFt || 0) * 30.48 + Number(data.heightIn || 0) * 2.54);

    const weight =
      data.units === "metric"
        ? Number(data.weightKg)
        : Math.round(Number(data.weightLbs) * 0.453592);

    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        height,
        weight,
        goal: data.goal,
        fitnessLevel: data.fitnessLevel,
      });

      if (res.success) {
        setStep(8);
      } else {
        setError(res.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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

      <div className="w-full max-w-[440px] relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Main Container */}
            <div className="glass-panel-purple rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Progress */}
              {step > 0 && step < 8 && (
                <ProgressBar currentStep={step} totalSteps={7} />
              )}

              {/* STEP 0: Welcome */}
              {step === 0 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 12 }}
                    className="w-20 h-20 bg-gradient-to-br from-auth-accent to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-auth-accent/30"
                  >
                    <span className="text-4xl -rotate-12">🏋️</span>
                  </motion.div>
                  <h1 className="text-3xl font-black text-white mb-3 tracking-tight">GymStreak</h1>
                  <p className="text-white/50 text-sm mb-10 leading-relaxed">
                    Your personalized fitness journey starts here. Let&apos;s build your dream physique together.
                  </p>
                  <SubmitButton onClick={() => setStep(1)} variant="gradient-purple">
                    Get Started
                  </SubmitButton>
                </div>
              )}

              {/* STEP 1: Name */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">What&apos;s your name?</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">Let&apos;s make this personal so we can cheer you on properly.</p>
                  <InputField
                    label="Full Name"
                    variant="glass"
                    value={data.name}
                    onChange={(e) => update("name", e.target.value)}
                    error={errors.name}
                    autoFocus
                  />
                </div>
              )}

              {/* STEP 2: Goal */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">What&apos;s your goal?</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">We&apos;ll customize your workout and nutrition plan accordingly.</p>
                  <div className="space-y-3">
                    {GOALS.map((g) => (
                      <SelectionCard
                        key={g.value}
                        icon={g.icon}
                        label={g.label}
                        description={g.description}
                        selected={data.goal === g.value}
                        onClick={() => update("goal", g.value)}
                      />
                    ))}
                  </div>
                  {errors.goal && (
                    <p className="mt-3 text-xs text-red-400 font-medium">{errors.goal}</p>
                  )}
                </div>
              )}

              {/* STEP 3: Fitness Level */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Your fitness level?</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">No judgement here! We just want to find the right starting intensity.</p>
                  <div className="space-y-3">
                    {FITNESS_LEVELS.map((fl) => (
                      <SelectionCard
                        key={fl.value}
                        icon={fl.icon}
                        label={fl.label}
                        description={fl.description}
                        selected={data.fitnessLevel === fl.value}
                        onClick={() => update("fitnessLevel", fl.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Units */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Preferred units?</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">We&apos;ll adjust all measurements to your preference.</p>
                  <div className="space-y-3">
                    {UNIT_SYSTEMS.map((u) => (
                      <SelectionCard
                        key={u.value}
                        label={u.label}
                        description={u.description}
                        selected={data.units === u.value}
                        onClick={() => update("units", u.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Height & Weight */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Your measurements</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">This helps us calculate your BMI and caloric needs.</p>
                  {data.units === "metric" ? (
                    <div className="space-y-6">
                      <InputField
                        label="Height (cm)"
                        type="number"
                        variant="glass"
                        value={data.heightCm}
                        onChange={(e) => update("heightCm", e.target.value)}
                        error={errors.heightCm}
                      />
                      <InputField
                        label="Weight (kg)"
                        type="number"
                        variant="glass"
                        value={data.weightKg}
                        onChange={(e) => update("weightKg", e.target.value)}
                        error={errors.weightKg}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Feet"
                          type="number"
                          variant="glass"
                          value={data.heightFt}
                          onChange={(e) => update("heightFt", e.target.value)}
                          error={errors.heightFt}
                        />
                        <InputField
                          label="Inches"
                          type="number"
                          variant="glass"
                          value={data.heightIn}
                          onChange={(e) => update("heightIn", e.target.value)}
                        />
                      </div>
                      <InputField
                        label="Weight (lbs)"
                        type="number"
                        variant="glass"
                        value={data.weightLbs}
                        onChange={(e) => update("weightLbs", e.target.value)}
                        error={errors.weightLbs}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: Target Weight */}
              {step === 6 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Target weight?</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">Set a realistic goal — you can always adjust this later.</p>
                  <InputField
                    label={data.units === "metric" ? "Target Weight (kg)" : "Target Weight (lbs)"}
                    type="number"
                    variant="glass"
                    value={data.units === "metric" ? data.targetWeightKg : data.targetWeightLbs}
                    onChange={(e) => update(data.units === "metric" ? "targetWeightKg" : "targetWeightLbs", e.target.value)}
                    error={errors.targetWeightKg || errors.targetWeightLbs}
                  />
                  <div className="mt-6 p-4 rounded-xl bg-auth-accent/5 border border-auth-accent/10">
                    <p className="text-xs text-auth-accent/80 leading-relaxed text-center font-medium">
                      💡 Pro Tip: A healthy weight change rate is typically 0.5–1 kg (1–2 lbs) per week.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 7: Account */}
              {step === 7 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Create your account</h2>
                  <p className="text-sm text-white/40 mb-8 leading-relaxed">Almost there, {data.name.split(" ")[0]}! Save your progress.</p>
                  <div className="space-y-4">
                    <InputField
                      label="Email"
                      type="email"
                      variant="glass"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      error={errors.email}
                    />
                    <InputField
                      label="Password"
                      type="password"
                      variant="glass"
                      value={data.password}
                      onChange={(e) => update("password", e.target.value)}
                      error={errors.password}
                    />
                    <InputField
                      label="Confirm Password"
                      type="password"
                      variant="glass"
                      value={data.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      error={errors.confirmPassword}
                    />
                  </div>
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 8: Success */}
              {step === 8 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <span className="text-4xl">🎉</span>
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-3 tracking-tight">You&apos;re all set!</h2>
                  <p className="text-white/50 text-sm mb-10 leading-relaxed">
                    Welcome to GymStreak, {data.name.split(" ")[0]}. Your personalized fitness plan is ready and waiting.
                  </p>
                  <SubmitButton onClick={() => router.push("/dashboard")} variant="neon">
                    Go to Dashboard →
                  </SubmitButton>
                </div>
              )}

              {/* Navigation buttons */}
              {step > 0 && step < 8 && (
                <div className="flex gap-4 mt-10">
                  <button
                    onClick={back}
                    className="flex-1 py-4 px-4 rounded-xl border-2 border-white/10 text-white/50 font-bold text-sm hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  {step === 7 ? (
                    <SubmitButton
                      onClick={handleSubmit}
                      loading={loading}
                      fullWidth={false}
                      variant="gradient-purple"
                      className="flex-[2]"
                    >
                      Complete
                    </SubmitButton>
                  ) : (
                    <SubmitButton
                      onClick={next}
                      disabled={!canProceed()}
                      fullWidth={false}
                      variant="gradient-purple"
                      className="flex-[2]"
                    >
                      Next Step
                    </SubmitButton>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
