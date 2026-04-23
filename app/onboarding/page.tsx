"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/ui/ProgressBar";
import StepCard from "@/components/ui/StepCard";
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
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
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
    <div className="min-h-screen bg-onboarding-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8">
              {/* Progress — skip welcome and success */}
              {step > 0 && step < 8 && (
                <ProgressBar currentStep={step} totalSteps={7} />
              )}

              {/* STEP 0: Welcome */}
              {step === 0 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🏋️</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">GymStreak</h1>
                  <p className="text-gray-500 text-sm mb-8">
                    Your personalized fitness journey starts here
                  </p>
                  <SubmitButton onClick={() => setStep(1)}>
                    Get Started
                  </SubmitButton>
                </div>
              )}

              {/* STEP 1: Name */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">What&apos;s your name?</h2>
                  <p className="text-sm text-gray-500 mb-6">Let&apos;s make this personal</p>
                  <InputField
                    label="Full Name"
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
                  <h2 className="text-xl font-bold text-gray-900 mb-1">What&apos;s your goal?</h2>
                  <p className="text-sm text-gray-500 mb-6">We&apos;ll customize your plan</p>
                  <div className="space-y-2">
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
                    <p className="mt-2 text-xs text-red-500">{errors.goal}</p>
                  )}
                </div>
              )}

              {/* STEP 3: Fitness Level */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Your fitness level?</h2>
                  <p className="text-sm text-gray-500 mb-6">No judgement here!</p>
                  <div className="space-y-2">
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
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Preferred units?
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    We&apos;ll adjust all measurements
                  </p>
                  <div className="space-y-2">
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
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Your measurements
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    This helps us create your perfect plan
                  </p>
                  {data.units === "metric" ? (
                    <div className="space-y-4">
                      <InputField
                        label="Height (cm)"
                        type="number"
                        value={data.heightCm}
                        onChange={(e) => update("heightCm", e.target.value)}
                        error={errors.heightCm}
                      />
                      <InputField
                        label="Weight (kg)"
                        type="number"
                        value={data.weightKg}
                        onChange={(e) => update("weightKg", e.target.value)}
                        error={errors.weightKg}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <InputField
                          label="Feet"
                          type="number"
                          value={data.heightFt}
                          onChange={(e) => update("heightFt", e.target.value)}
                          error={errors.heightFt}
                        />
                        <InputField
                          label="Inches"
                          type="number"
                          value={data.heightIn}
                          onChange={(e) => update("heightIn", e.target.value)}
                        />
                      </div>
                      <InputField
                        label="Weight (lbs)"
                        type="number"
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
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Target weight?
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Set a realistic goal — you can always adjust later
                  </p>
                  <InputField
                    label={
                      data.units === "metric"
                        ? "Target Weight (kg)"
                        : "Target Weight (lbs)"
                    }
                    type="number"
                    value={
                      data.units === "metric"
                        ? data.targetWeightKg
                        : data.targetWeightLbs
                    }
                    onChange={(e) =>
                      update(
                        data.units === "metric"
                          ? "targetWeightKg"
                          : "targetWeightLbs",
                        e.target.value
                      )
                    }
                    error={
                      errors.targetWeightKg || errors.targetWeightLbs
                    }
                  />
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    💡 A healthy rate is 0.5–1 kg (1–2 lbs) per week
                  </p>
                </div>
              )}

              {/* STEP 7: Account */}
              {step === 7 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Create your account
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Almost there, {data.name.split(" ")[0]}!
                  </p>
                  <div className="space-y-4">
                    <InputField
                      label="Email"
                      type="email"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      error={errors.email}
                    />
                    <InputField
                      label="Password"
                      type="password"
                      value={data.password}
                      onChange={(e) => update("password", e.target.value)}
                      error={errors.password}
                    />
                    <InputField
                      label="Confirm Password"
                      type="password"
                      value={data.confirmPassword}
                      onChange={(e) =>
                        update("confirmPassword", e.target.value)
                      }
                      error={errors.confirmPassword}
                    />
                  </div>
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
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
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <span className="text-4xl">🎉</span>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    You&apos;re all set!
                  </h2>
                  <p className="text-gray-500 text-sm mb-8">
                    Welcome to GymStreak, {data.name.split(" ")[0]}. Your personalized
                    plan is ready.
                  </p>
                  <SubmitButton
                    onClick={() => router.push("/dashboard")}
                  >
                    Continue to Dashboard →
                  </SubmitButton>
                </div>
              )}

              {/* Navigation buttons */}
              {step > 0 && step < 8 && (
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={back}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  {step === 7 ? (
                    <SubmitButton
                      onClick={handleSubmit}
                      loading={loading}
                      fullWidth={false}
                      className="flex-1"
                    >
                      Create Account
                    </SubmitButton>
                  ) : (
                    <SubmitButton
                      onClick={next}
                      disabled={!canProceed()}
                      fullWidth={false}
                      className="flex-1"
                    >
                      Next
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
