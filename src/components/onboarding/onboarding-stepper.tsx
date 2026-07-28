"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle, ChevronRight, Play, Lock, Building2, Users, Banknote, Link, Shield, Workflow, Bot, Activity, Cpu } from "lucide-react";

interface StepItem {
  stepId: string;
  label: string;
  category: string;
  status: string;
  isRequired: boolean;
  isActive: boolean;
  isBlocked: boolean;
  error: string | null;
}

interface StepperProps {
  steps: StepItem[];
  overall: {
    completed: number;
    total: number;
    percentComplete: number;
  };
  estimatedRemainingMinutes: number;
  onStepClick: (stepId: string) => void;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  "company-setup": Building2,
  "org-structure": Users,
  users: Users,
  "treasury-setup": Banknote,
  integrations: Link,
  governance: Shield,
  workflows: Workflow,
  ai: Bot,
  operations: Activity,
  intelligence: Cpu,
};

function StepIcon({ stepId, status }: { stepId: string; status: string }) {
  const Icon = STEP_ICONS[stepId];
  if (!Icon) return null;

  const colors: Record<string, string> = {
    COMPLETED: "text-emerald-400",
    IN_PROGRESS: "text-gold",
    FAILED: "text-red-400",
    SKIPPED: "text-zinc-500",
    PENDING: "text-zinc-600",
  };

  return (
    <div className={cn(
      "flex h-8 w-8 items-center justify-center rounded-lg",
      status === "IN_PROGRESS" ? "bg-gold/10" : "bg-transparent",
    )}>
      <Icon className={cn("h-4 w-4", colors[status] ?? "text-zinc-600")} />
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case "IN_PROGRESS":
      return <Play className="h-4 w-4 text-gold" />;
    case "FAILED":
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    case "SKIPPED":
      return <ChevronRight className="h-4 w-4 text-zinc-500" />;
    default:
      return <Circle className="h-4 w-4 text-zinc-600" />;
  }
}

export function OnboardingStepper({ steps, overall, estimatedRemainingMinutes, onStepClick }: StepperProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Progress</span>
          <span className="text-xs text-zinc-500">
            {overall.completed}/{overall.total}
          </span>
        </div>
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gold transition-all duration-500"
              style={{ width: `${overall.percentComplete}%` }}
            />
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-zinc-500">
          {overall.percentComplete}% · ~{estimatedRemainingMinutes} min remaining
        </div>
      </div>

      <nav className="p-2" aria-label="Setup steps">
        <ol className="space-y-1">
          {steps.map((step, index) => {
            const isClickable = !step.isBlocked && step.status === "PENDING";
            return (
              <li key={step.stepId}>
                <button
                  onClick={() => isClickable && onStepClick(step.stepId)}
                  disabled={!isClickable}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    step.isActive && "bg-gold/10 ring-1 ring-gold/20",
                    isClickable && !step.isActive && "hover:bg-white/[0.04] cursor-pointer",
                    !isClickable && !step.isActive && "cursor-default",
                  )}
                  aria-current={step.isActive ? "step" : undefined}
                >
                  <StepIcon stepId={step.stepId} status={step.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "truncate text-sm",
                        step.isActive ? "text-white font-medium" : "text-zinc-400",
                        step.status === "COMPLETED" && "text-zinc-300",
                      )}>
                        {step.label}
                      </span>
                      {step.isBlocked && <Lock className="h-3 w-3 shrink-0 text-zinc-600" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn(
                        "text-[10px] uppercase tracking-wider",
                        step.category === "core" && "text-gold/60",
                        step.category === "integration" && "text-blue-400/60",
                        step.category === "governance" && "text-emerald-400/60",
                        step.category === "automation" && "text-purple-400/60",
                        step.category === "analytics" && "text-cyan-400/60",
                      )}>
                        {step.category}
                      </span>
                      {step.isRequired && (
                        <span className="text-[10px] text-zinc-600">Required</span>
                      )}
                    </div>
                  </div>
                  <StatusIndicator status={step.status} />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
