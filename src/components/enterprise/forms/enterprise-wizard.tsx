"use client";

import { useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WizardStep } from "./types";

interface EnterpriseWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  children: React.ReactNode;
  className?: string;
  completeLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  saving?: boolean;
  hideStepBar?: boolean;
}

export const EnterpriseWizard = memo(function EnterpriseWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  className,
  completeLabel = "Complete",
  nextLabel = "Next",
  backLabel = "Back",
  saving,
  hideStepBar,
}: EnterpriseWizardProps) {
  const goNext = useCallback(() => {
    const step = steps[currentStep];
    if (step?.validate && !step.validate()) return;
    if (currentStep < steps.length - 1) onStepChange(currentStep + 1);
    else onComplete();
  }, [currentStep, steps, onStepChange, onComplete]);

  const goBack = useCallback(() => {
    if (currentStep > 0) onStepChange(currentStep - 1);
  }, [currentStep, onStepChange]);

  const isLast = currentStep === steps.length - 1;

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30", className)}>
      {!hideStepBar && (
        <div className="border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => i < currentStep && onStepChange(i)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    i === currentStep && "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30",
                    i < currentStep && "bg-emerald-500/10 text-emerald-400 cursor-pointer hover:bg-emerald-500/20",
                    i > currentStep && "text-zinc-600",
                  )}
                >
                  {i < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500">
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-zinc-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-5">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white">{steps[currentStep].title}</h3>
          {steps[currentStep].description && (
            <p className="mt-0.5 text-xs text-zinc-500">{steps[currentStep].description}</p>
          )}
        </div>
        {children}
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
        <Button type="button" variant="ghost" onClick={goBack} disabled={currentStep === 0 || saving}>
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Button>
        <Button type="button" onClick={goNext} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLast ? (
            completeLabel
          ) : (
            <>
              {nextLabel}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
