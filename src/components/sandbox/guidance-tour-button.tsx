"use client";

import { useOnboarding } from "@/components/sandbox/onboarding-context";
import { Play, RotateCcw } from "lucide-react";

interface GuidanceTourButtonProps {
  isComplete: boolean;
  hasStarted: boolean;
}

export function GuidanceTourButton({ isComplete, hasStarted }: GuidanceTourButtonProps) {
  const { startTour } = useOnboarding();

  return (
    <button
      onClick={() => startTour()}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isComplete
          ? "border border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
          : "bg-amber-400 text-black hover:bg-amber-500"
      }`}
    >
      {isComplete ? (
        <>
          <RotateCcw className="h-3.5 w-3.5" />
          Retake
        </>
      ) : hasStarted ? (
        <>
          <Play className="h-3.5 w-3.5" />
          Resume
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5" />
          Start
        </>
      )}
    </button>
  );
}
