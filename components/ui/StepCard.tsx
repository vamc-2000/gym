"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface StepCardProps {
  children: ReactNode;
  stepKey: string | number;
}

export default function StepCard({ children, stepKey }: StepCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
