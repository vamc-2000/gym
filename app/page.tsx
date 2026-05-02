"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const landingSections = [
    {
      title: "Smart Workout Engine",
      description:
        "Our AI analyzes your performance in real-time to adjust intensity, ensuring you're always pushing your limits without burnout.",
      image: "/landing1.png",
      color: "from-neon-blue to-cyan-500",
    },
    {
      title: "Nutrition at its Core",
      description:
        "Stop guessing your macros. Get precise meal plans and track your intake with a database of over 1 million foods.",
      image: "/landing2.png",
      color: "from-neon-yellow to-amber-500",
    },
    {
      title: "Consistency Redefined",
      description:
        "The Streak System gamifies your fitness journey. Earn rewards, unlock achievements, and never miss a Monday again.",
      image: "/landing3.png",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Global Leaderboard",
      description:
        "Compete with athletes across the globe. Rise through the ranks, join leagues, and claim your spot at the top.",
      image: "/landing4.png",
      color: "from-emerald-500 to-teal-400",
    },
    {
      title: "Deep Analytics",
      description:
        "Visualize every rep and every calorie. Interactive charts give you the insight you need to optimize your results.",
      image: "/landing5.png",
      color: "from-blue-600 to-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-dash-bg text-white selection:bg-neon-blue/30">

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50
                   flex items-center justify-between
                   px-4 sm:px-6 lg:px-10
                   py-3 sm:py-4
                   bg-dash-bg/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">🏋️</span>
          <span className="text-base sm:text-lg font-bold">
            <span className="text-glow-blue">Gym</span>
            <span className="text-glow-yellow">Streak</span>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/login")}
            className="text-white/60 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Log In
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/register")}
            className="px-3 sm:px-5 py-1.5 sm:py-2
                       bg-gradient-to-r from-neon-yellow to-amber-500
                       text-dash-bg rounded-lg sm:rounded-xl
                       font-bold text-xs sm:text-sm
                       hover:shadow-lg hover:shadow-neon-yellow/20
                       transition-all cursor-pointer"
          >
            Join Now
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden
                   min-h-screen
                   pt-16 sm:pt-20
                   pb-20 sm:pb-24
                   px-4 sm:px-6"
      >
        {/* Background grid */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,245,255,0.05),transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center w-full
                     max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl
                     mx-auto"
        >
          {/* Logo badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                       bg-gradient-to-br from-neon-yellow to-neon-blue
                       rounded-2xl sm:rounded-3xl
                       flex items-center justify-center
                       mx-auto mb-5 sm:mb-7 md:mb-8
                       shadow-2xl shadow-neon-blue/20 rotate-12"
          >
            <span className="text-xl sm:text-2xl md:text-4xl -rotate-12">🏋️</span>
          </motion.div>

          {/* Headline */}
          <h1
            className="font-black tracking-tight leading-tight
                       text-3xl sm:text-5xl md:text-6xl lg:text-7xl
                       mb-4 sm:mb-5 md:mb-6"
          >
            EVOLVE YOUR{" "}
            <span
              className="bg-clip-text text-transparent
                         bg-gradient-to-r from-neon-blue via-neon-yellow to-neon-blue
                         bg-[length:200%_auto] animate-gradient-x"
            >
              FITNESS JOURNEY
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-white/50 leading-relaxed mx-auto
                       text-sm sm:text-base md:text-lg lg:text-xl
                       max-w-xs sm:max-w-md md:max-w-2xl
                       mb-7 sm:mb-9 md:mb-12"
          >
            The next generation of fitness tracking. Powered by AI, driven by
            consistency, and built for results.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/onboarding")}
              className="inline-flex items-center gap-2
                         px-6 sm:px-8 md:px-10
                         py-3 sm:py-3.5 md:py-4
                         bg-white text-dash-bg
                         rounded-xl sm:rounded-2xl
                         font-black
                         text-sm sm:text-base
                         hover:shadow-2xl hover:shadow-white/10
                         transition-all cursor-pointer group"
            >
              START TRAINING
              <span className="inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2
                     flex flex-col items-center gap-1.5 sm:gap-2
                     opacity-40 pointer-events-none"
        >
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">
            Explore Features
          </span>
          <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* ── Feature Showcase ── */}
      <section
        className="py-16 sm:py-24
                   px-4 sm:px-6 md:px-10 lg:px-20
                   max-w-7xl mx-auto
                   space-y-20 sm:space-y-32 lg:space-y-48"
      >
        {landingSections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`flex flex-col
                        ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}
                        items-center
                        gap-8 sm:gap-10 lg:gap-20`}
          >
            {/* Text block */}
            <div className="flex-1 w-full space-y-4 sm:space-y-5 text-center lg:text-left">
              <div
                className={`w-10 sm:w-12 h-1 bg-gradient-to-r ${section.color} rounded-full mx-auto lg:mx-0`}
              />
              <h2
                className="font-bold text-white tracking-tight leading-tight
                           text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
              >
                {section.title}
              </h2>
              <p
                className="text-white/50 leading-relaxed
                           text-sm sm:text-base md:text-lg lg:text-xl
                           max-w-sm sm:max-w-md lg:max-w-none mx-auto lg:mx-0"
              >
                {section.description}
              </p>
              <div className="flex items-center gap-3 sm:gap-4 justify-center lg:justify-start pt-1">
                <span className="text-xs sm:text-sm font-bold tracking-widest text-white/20 uppercase">
                  Featured in GymStreak v2.0
                </span>
              </div>
            </div>

            {/* Image block */}
            <div className="flex-1 w-full relative group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden
                           border border-white/10 shadow-2xl bg-gray-900"
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-auto object-cover
                             transform transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
              <div
                className={`absolute -inset-4 bg-gradient-to-br ${section.color}
                            opacity-15 blur-3xl rounded-full z-0
                            group-hover:opacity-25 transition-opacity`}
              />
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto
                     bg-gradient-to-br from-dash-card to-dash-bg
                     border border-white/5
                     p-8 sm:p-12 md:p-16 lg:p-20
                     rounded-3xl sm:rounded-[3rem]
                     relative overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-neon-blue/10 rounded-full blur-[100px] sm:blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-neon-yellow/10 rounded-full blur-[100px] sm:blur-[120px]" />
          <h2
            className="font-bold mb-6 sm:mb-8 relative z-10
                       text-2xl sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Ready to break your limits?
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/register")}
            className="px-7 sm:px-10 md:px-12
                       py-3.5 sm:py-5 md:py-6
                       bg-gradient-to-r from-neon-yellow to-amber-500
                       text-dash-bg rounded-xl sm:rounded-2xl
                       font-black
                       text-base sm:text-lg md:text-xl
                       hover:shadow-2xl hover:shadow-neon-yellow/30
                       transition-all cursor-pointer relative z-10"
          >
            CLAIM YOUR FREE ACCOUNT
          </motion.button>
          <p className="mt-5 sm:mt-8 text-white/30 font-medium relative z-10 text-xs sm:text-sm">
            No credit card required • Instant access • Premium features included
          </p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 sm:py-12
                   border-t border-white/5
                   px-4 sm:px-6 lg:px-20
                   flex flex-col sm:flex-row
                   justify-between items-center
                   gap-4 sm:gap-6 lg:gap-8
                   text-white/30 text-xs sm:text-sm font-medium"
      >
        <div className="flex items-center gap-2">
          <span>🏋️</span>
          <span className="font-bold text-white/60">GymStreak</span>
        </div>
        <div className="flex gap-6 sm:gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
        <p>© 2026 GymStreak AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
