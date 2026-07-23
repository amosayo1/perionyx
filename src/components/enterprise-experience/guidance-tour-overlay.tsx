"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeIn, scaleInDown, fadeInUp } from "@/components/enterprise/motion/tokens";
import type { ProductGuidanceData, UserGuidanceProgressData } from "@/modules/enterprise-experience/types";
import { X, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface GuidanceTourOverlayProps {
  tour: ProductGuidanceData;
  progress: UserGuidanceProgressData;
  onNext: (stepIndex: number) => void;
  onDismiss: () => void;
  onComplete: () => void;
}

const placementStyles: Record<string, string> = {
  top: "bottom-full mb-3",
  bottom: "top-full mt-3",
  left: "right-full mr-3",
  right: "left-full ml-3",
  center: "",
};

const arrowStyles: Record<string, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-x-transparent border-b-transparent border-t-zinc-800",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-x-transparent border-t-transparent border-b-zinc-800",
  left: "left-full top-1/2 -translate-y-1/2 border-y-transparent border-r-transparent border-l-zinc-800",
  right: "right-full top-1/2 -translate-y-1/2 border-y-transparent border-l-transparent border-r-zinc-800",
};

export function GuidanceTourOverlay({ tour, progress, onNext, onDismiss, onComplete }: GuidanceTourOverlayProps) {
  const currentStep = tour.steps[progress.stepIndex];
  const isLastStep = progress.stepIndex >= tour.steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext(progress.stepIndex + 1);
    }
  }, [isLastStep, onComplete, onNext, progress.stepIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss, handleNext]);

  if (!currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          key={progress.stepIndex}
          variants={scaleInDown}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "relative mx-4 max-w-md rounded-xl border border-white/[0.06] bg-zinc-900 p-6 shadow-2xl",
            currentStep.placement === "center" ? "" : currentStep.placement && placementStyles[currentStep.placement],
          )}
        >
          {currentStep.placement && currentStep.placement !== "center" && (
            <div className={cn("absolute h-0 w-0 border-8", arrowStyles[currentStep.placement])} />
          )}

          <button
            onClick={onDismiss}
            aria-label="Dismiss tour"
            className="absolute right-3 top-3 rounded-md p-1 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-4">
            <p className="text-xs font-medium text-amber-400">
              Step {progress.stepIndex + 1} of {tour.steps.length}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">{currentStep.title}</h3>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-zinc-400">{currentStep.content}</p>

          {currentStep.mediaUrl && (
            <img
              src={currentStep.mediaUrl}
              alt={currentStep.title}
              className="mb-4 w-full rounded-lg border border-white/[0.06] object-cover"
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1.5">
              {tour.steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full transition-colors",
                    i === progress.stepIndex ? "bg-amber-400" : "bg-zinc-600",
                  )}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onDismiss}
                className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white"
              >
                Skip
              </button>
              {currentStep.actionLabel && currentStep.actionUrl && (
                <a
                  href={currentStep.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-black hover:bg-amber-500"
                >
                  {currentStep.actionLabel}
                </a>
              )}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-500"
              >
                {isLastStep ? (
                  <><CheckCircle2 className="h-4 w-4" /> Complete</>
                ) : (
                  <><ArrowRight className="h-4 w-4" /> Next</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
