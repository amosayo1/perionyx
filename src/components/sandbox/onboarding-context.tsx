"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";

type Persona = "CEO" | "CFO" | "Treasurer" | "Risk Officer" | "Auditor" | "Finance Manager" | "Compliance Officer" | "Developer";

type CompletedTask = {
  id: string;
  label: string;
  module: string;
  completedAt: string;
};

type OnboardingState = {
  welcomeDismissed: boolean;
  guideCompleted: boolean;
  currentTourStep: number;
  tourActive: boolean;
  selectedPersona: Persona;
  missionPanelOpen: boolean;
  completedTasks: CompletedTask[];
  dismissedHints: string[];
  scenarioCompleted: string[];
};

type OnboardingContextType = OnboardingState & {
  dismissWelcome: () => void;
  startTour: () => void;
  stopTour: () => void;
  setTourStep: (step: number) => void;
  setPersona: (p: Persona) => void;
  setMissionPanelOpen: (open: boolean) => void;
  addCompletedTask: (task: { id: string; label: string; module: string }) => void;
  dismissHint: (hintId: string) => void;
  completeScenario: (scenarioId: string) => void;
  getSuggestedNext: () => { id: string; label: string; module: string; href: string } | null;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const LS_KEY = "perionyx-onboarding";

function loadState(): Partial<OnboardingState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveState(state: Partial<OnboardingState>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

const DEFAULT_RECOMMENDATIONS: Array<{ id: string; label: string; module: string; href: string }> = [
  { id: "task-executive-overview", label: "View Executive Dashboard", module: "Dashboard", href: "/dashboard" },
  { id: "task-create-payment", label: "Create a Payment", module: "Transactions", href: "/transactions" },
  { id: "task-approve-payment", label: "Review and Approve Payment", module: "Approvals", href: "/approvals" },
  { id: "task-view-ledger", label: "View Ledger Entry", module: "Ledger", href: "/ledger" },
  { id: "task-review-audit", label: "Review Audit Trail", module: "Audit", href: "/audit-logs" },
  { id: "task-check-risk", label: "Check Risk Alerts", module: "Risk", href: "/risk" },
  { id: "task-run-report", label: "Generate Treasury Report", module: "Reports", href: "/reports" },
  { id: "task-ask-copilot", label: "Ask Copilot a Question", module: "Copilot", href: "/copilot" },
  { id: "task-run-reconciliation", label: "Run Reconciliation", module: "Reconciliation", href: "/reconciliation" },
  { id: "task-view-wallets", label: "View Wallet Balances", module: "Wallets", href: "/wallets" },
  { id: "task-run-scenario", label: "Launch a Business Scenario", module: "Scenarios", href: "" },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const saved = loadState();
  const isSandbox = session?.user?.isSandbox === true;

  const [state, setState] = useState<OnboardingState>({
    welcomeDismissed: saved.welcomeDismissed ?? !isSandbox,
    guideCompleted: saved.guideCompleted ?? false,
    currentTourStep: saved.currentTourStep ?? 0,
    tourActive: saved.tourActive ?? false,
    selectedPersona: (saved.selectedPersona as Persona) ?? "CFO",
    missionPanelOpen: saved.missionPanelOpen ?? false,
    completedTasks: saved.completedTasks ?? [],
    dismissedHints: saved.dismissedHints ?? [],
    scenarioCompleted: saved.scenarioCompleted ?? [],
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Auto-open mission panel for new sandbox users
  useEffect(() => {
    if (isSandbox && !state.welcomeDismissed) {
      setState((s) => ({ ...s, missionPanelOpen: true }));
    }
  }, [isSandbox, state.welcomeDismissed]);

  const dismissWelcome = useCallback(() => setState((s) => ({ ...s, welcomeDismissed: true })), []);
  const startTour = useCallback(() => setState((s) => ({ ...s, tourActive: true, currentTourStep: 0 })), []);
  const stopTour = useCallback(() => setState((s) => ({ ...s, tourActive: false, guideCompleted: true })), []);
  const setTourStep = useCallback((step: number) => setState((s) => ({ ...s, currentTourStep: step })), []);
  const setPersona = useCallback((p: Persona) => setState((s) => ({ ...s, selectedPersona: p })), []);
  const setMissionPanelOpen = useCallback((open: boolean) => setState((s) => ({ ...s, missionPanelOpen: open })), []);
  const dismissHint = useCallback((hintId: string) => setState((s) => ({ ...s, dismissedHints: [...s.dismissedHints, hintId] })), []);

  const addCompletedTask = useCallback((task: { id: string; label: string; module: string }) => {
    setState((s) => {
      if (s.completedTasks.some((t) => t.id === task.id)) return s;
      return {
        ...s,
        completedTasks: [...s.completedTasks, { ...task, completedAt: new Date().toISOString() }],
      };
    });
  }, []);

  const completeScenario = useCallback((scenarioId: string) => {
    setState((s) => {
      if (s.scenarioCompleted.includes(scenarioId)) return s;
      return { ...s, scenarioCompleted: [...s.scenarioCompleted, scenarioId] };
    });
  }, []);

  const getSuggestedNext = useCallback(() => {
    const completedIds = new Set(state.completedTasks.map((t) => t.id));
    const next = DEFAULT_RECOMMENDATIONS.find((r) => !completedIds.has(r.id));
    return next ?? null;
  }, [state.completedTasks]);

  const ctx: OnboardingContextType = {
    ...state,
    dismissWelcome,
    startTour,
    stopTour,
    setTourStep,
    setPersona,
    setMissionPanelOpen,
    addCompletedTask,
    dismissHint,
    completeScenario,
    getSuggestedNext,
  };

  return <OnboardingContext.Provider value={ctx}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
