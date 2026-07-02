"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

type DemoStep = { id: number; title: string };

const STEPS: DemoStep[] = [
  { id: 1, title: "Payment Request" },
  { id: 2, title: "Policy Engine" },
  { id: 3, title: "Approval Workflow" },
  { id: 4, title: "CFO Review" },
  { id: 5, title: "Ledger Posting" },
  { id: 6, title: "Treasury Execution" },
  { id: 7, title: "Audit Trail" },
  { id: 8, title: "Dashboard" },
  { id: 9, title: "Complete" },
];

export type DashboardMetrics = {
  totalBalance: { old: number; new: number; current: number };
  pendingApprovals: { old: number; new: number; current: number };
  auditEvents: { old: number; new: number; current: number };
  completedPayments: { old: number; new: number; current: number };
};

type DemoContextValue = {
  currentStep: number;
  totalSteps: number;
  steps: DemoStep[];
  goToNext: () => void;
  goToPrev: () => void;
  goToStep: (id: number) => void;
  canGoNext: boolean;
  setCanGoNext: (v: boolean) => void;
  transactionId: string;
  metrics: DashboardMetrics;
  setMetricValue: (key: keyof DashboardMetrics, value: Partial<DashboardMetrics[keyof DashboardMetrics]>) => void;
  notificationCount: number;
  setNotificationCount: (v: number) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

const DEFAULT_METRICS: DashboardMetrics = {
  totalBalance: { old: 4280000, new: 4280000, current: 4280000 },
  pendingApprovals: { old: 4, new: 4, current: 4 },
  auditEvents: { old: 12, new: 12, current: 12 },
  completedPayments: { old: 8, new: 8, current: 8 },
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [canGoNext, setCanGoNext] = useState(true);
  const [transactionId] = useState("TXN-0421");
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [notificationCount, setNotificationCount] = useState(0);

  const setMetricValue = useCallback((
    key: keyof DashboardMetrics,
    value: Partial<DashboardMetrics[keyof DashboardMetrics]>,
  ) => {
    setMetrics((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...value },
    }));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    setCanGoNext(true);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    setCanGoNext(true);
  }, []);

  const goToStep = useCallback((id: number) => {
    setCurrentStep(Math.max(1, Math.min(id, STEPS.length)));
    setCanGoNext(true);
  }, []);

  return (
    <DemoContext.Provider
      value={{
        currentStep,
        totalSteps: STEPS.length,
        steps: STEPS,
        goToNext,
        goToPrev,
        goToStep,
        canGoNext,
        setCanGoNext,
        transactionId,
        metrics,
        setMetricValue,
        notificationCount,
        setNotificationCount,
      }}
    >
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </DemoContext.Provider>
  );
}
