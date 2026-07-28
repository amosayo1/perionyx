"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OnboardingStepper } from "./onboarding-stepper";
import { OnboardingReadiness } from "./onboarding-readiness";
import { OnboardingDashboardPreview } from "./onboarding-dashboard-preview";
import { EnterpriseWizard } from "@/components/enterprise/forms/enterprise-wizard";
import { EnterpriseForm } from "@/components/enterprise/forms/enterprise-form";
import { EnterpriseSection } from "@/components/enterprise/forms/enterprise-section";
import { EnterpriseField } from "@/components/enterprise/forms/enterprise-field";
import { ReviewStep } from "@/components/enterprise/forms/review-step";
import type { WizardStep } from "@/components/enterprise/forms/types";
import {
  CheckCircle2, Circle, AlertCircle, ChevronRight, ChevronLeft, Play,
  RotateCcw, ArrowRight, FileCheck, BarChart3, Settings, Shield,
  Users, Building2, Banknote, Link, Workflow, Bot, Activity,
  Cpu,
} from "lucide-react";

interface StepDef {
  id: string;
  label: string;
  description: string;
  category: string;
  isRequired: boolean;
}

interface StepRecord {
  stepId: string;
  status: string;
  error: string | null;
  metadata: Record<string, unknown>;
}

interface StepInfo {
  definition: StepDef;
  record: StepRecord;
}

interface WizardProgress {
  sessionId: string;
  companyId: string;
  status: string;
  overall: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    skipped: number;
    failed: number;
    percentComplete: number;
  };
  currentStep: StepDef | null;
  steps: StepInfo[];
  nextSteps: string[];
  blockedSteps: Array<{ stepId: string; prerequisites: string[] }>;
  startedAt: string | null;
  completedAt: string | null;
  estimatedRemainingMinutes: number;
}

interface ReadinessInfo {
  checks: Array<{
    domain: string;
    label: string;
    status: string;
    score: number;
    details: string[];
    suggestions: string[];
  }>;
  overallScore: number;
  summary: { passed: number; warned: number; failed: number };
  suggestions: string[];
  completedAt: string;
}

interface WizardProps {
  progress: WizardProgress | null;
  readiness: ReadinessInfo | null;
  summary: {
    hasStarted: boolean;
    hasCompleted: boolean;
    percentComplete: number;
    currentStepName: string | null;
  };
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

function StatusIcon({ status }: { status: string }) {
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

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    COMPLETED: "success",
    IN_PROGRESS: "secondary",
    FAILED: "danger",
    SKIPPED: "outline",
    PENDING: "default",
  };
  return (
    <Badge variant={(variants[status] ?? "default") as any}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function OnboardingWizard({ progress, readiness, summary }: WizardProps) {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const handleStart = useCallback(async () => {
    try {
      setIsCreatingSession(true);
      const res = await fetch("/api/automation-studio/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "start" }),
      });
      if (!res.ok) throw new Error("Failed to start setup");
      window.location.reload();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  const wizardSteps: WizardStep[] = useMemo(() => {
    if (!progress?.steps) return [];
    return progress.steps.map((s) => {
      const StepIcon = STEP_ICONS[s.definition.id];
      return {
        id: s.definition.id,
        title: s.definition.label,
        description: s.definition.description,
        icon: StepIcon ? <StepIcon className="h-3 w-3" /> : undefined,
        optional: !s.definition.isRequired,
      };
    });
  }, [progress?.steps]);

  if (summary.hasCompleted && readiness) {
    return (
      <div className="space-y-8">
        <Card className="border-gold/20 bg-gradient-to-b from-emerald-900/20 to-black/40">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-xl text-white">Setup Complete</CardTitle>
            <CardDescription className="max-w-md text-sm text-zinc-400">
              All required steps have been configured. Your platform is ready for enterprise use.
            </CardDescription>
            <OnboardingReadiness readiness={readiness} />
          </CardContent>
        </Card>
        <OnboardingDashboardPreview />
      </div>
    );
  }

  if (!progress && !summary.hasStarted) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <EnterpriseWizard
          steps={[
            { id: "welcome", title: "Welcome", description: "Begin enterprise setup" },
          ]}
          currentStep={0}
          onStepChange={() => {}}
          onComplete={handleStart}
          completeLabel="Begin Setup"
          saving={isCreatingSession}
          hideStepBar
        >
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/10">
              <Settings className="h-10 w-10 text-gold" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Welcome to Enterprise Setup</CardTitle>
              <CardDescription className="mt-2 max-w-md text-sm text-zinc-400">
                Complete the following 10 steps to configure your enterprise platform.
                You can save progress and resume later.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span>~68 min estimated</span>
              <span className="text-zinc-700">|</span>
              <span>7 required</span>
              <span className="text-zinc-700">|</span>
              <span>3 optional</span>
            </div>
            {readiness && (
              <div className="mt-4 w-full">
                <OnboardingReadiness readiness={readiness} />
              </div>
            )}
          </div>
        </EnterpriseWizard>
      </div>
    );
  }

  if (!progress) {
    return (
      <Card className="border-gold/12 bg-perionyx-bg-panel">
        <CardContent className="py-10 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-zinc-500" />
          <p className="mt-3 text-sm text-zinc-400">Unable to load setup progress</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Reload
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStepDef = progress.currentStep;
  const currentRecord = progress.steps.find((s) => s.definition.id === currentStepDef?.id)?.record;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="order-2 lg:order-1">
        <OnboardingStepper
          steps={progress.steps.map((s) => ({
            stepId: s.definition.id,
            label: s.definition.label,
            category: s.definition.category,
            status: s.record.status,
            isRequired: s.definition.isRequired,
            isActive: s.definition.id === currentStepDef?.id,
            isBlocked: progress.blockedSteps.some((b) => b.stepId === s.definition.id),
            error: s.record.error,
          }))}
          overall={progress.overall}
          estimatedRemainingMinutes={progress.estimatedRemainingMinutes}
          onStepClick={() => {}}
        />
      </div>

      <div className="order-1 lg:order-2">
        <EnterpriseWizard
          steps={wizardSteps}
          currentStep={currentStepIdx}
          onStepChange={setCurrentStepIdx}
          onComplete={() => {}}
          hideStepBar
        >
          {currentStepDef && currentRecord ? (
            <EnterpriseForm
              title={currentStepDef.label}
              description={currentStepDef.description}
              compact
            >
              <EnterpriseSection
                config={{
                  id: "step-status",
                  title: "Step Status",
                  icon: currentStepDef && STEP_ICONS[currentStepDef.id] ? (
                    (() => {
                      const Icon = STEP_ICONS[currentStepDef.id];
                      return <Icon className="h-4 w-4" />;
                    })()
                  ) : undefined,
                }}
              >
                <EnterpriseField
                  label="Current Status"
                  htmlFor="step-status-badge"
                >
                  <StatusBadge status={currentRecord.status} />
                </EnterpriseField>
              </EnterpriseSection>

              {currentRecord.status === "COMPLETED" && (
                <EnterpriseSection
                  config={{
                    id: "step-completed",
                    title: "Completed",
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
                  }}
                >
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    This step has been completed
                  </div>
                </EnterpriseSection>
              )}

              {currentRecord.status === "FAILED" && currentRecord.error && (
                <EnterpriseSection
                  config={{
                    id: "step-error",
                    title: "Error",
                    icon: <AlertCircle className="h-4 w-4 text-red-400" />,
                  }}
                >
                  <div role="alert" className="flex items-center gap-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {currentRecord.error}
                  </div>
                </EnterpriseSection>
              )}

              <EnterpriseSection
                config={{
                  id: "step-description",
                  title: "Configuration",
                }}
              >
                <p className="text-sm text-zinc-500">
                  Configure this step by navigating to the appropriate section in the platform.
                  Once configured, mark it as complete from the step list.
                </p>
              </EnterpriseSection>
            </EnterpriseForm>
          ) : (
            <Card className="border-gold/12 bg-perionyx-bg-panel">
              <CardContent className="py-10 text-center">
                <FileCheck className="mx-auto h-8 w-8 text-emerald-400" />
                <p className="mt-3 text-sm font-medium text-white">All steps complete</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Review your readiness report below
                </p>
              </CardContent>
            </Card>
          )}
        </EnterpriseWizard>

        {readiness && (
          <div className="mt-6">
            <OnboardingReadiness readiness={readiness} />
          </div>
        )}
      </div>
    </div>
  );
}
