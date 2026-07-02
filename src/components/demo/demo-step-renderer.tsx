"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDemo } from "./demo-provider";
import type { ReactNode } from "react";

export function DemoStepRenderer({ steps }: { steps: Record<number, ReactNode> }) {
  const { currentStep } = useDemo();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {steps[currentStep] ?? null}
      </motion.div>
    </AnimatePresence>
  );
}
