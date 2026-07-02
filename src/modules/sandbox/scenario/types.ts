import type { TenantContext } from "@/server/context/tenant-context";

export type TimelineEvent = {
  step: number;
  timestamp: string;
  label: string;
  description: string;
  module: string;
  status: "success" | "warning" | "error" | "info";
  data?: Record<string, unknown>;
};

export type ScenarioResult = {
  scenarioId: string;
  scenarioTitle: string;
  status: "completed" | "failed" | "blocked" | "pending_approval";
  timeline: TimelineEvent[];
  records: ScenarioRecords;
  message: string;
};

export type ScenarioRecords = {
  transactionId?: string;
  approvalIds?: string[];
  riskAlertId?: string;
  riskIncidentId?: string;
  auditIds?: string[];
  notificationIds?: string[];
  ledgerEntryIds?: string[];
  walletId?: string;
  reconciliationRunId?: string;
};

export type ScenarioDefinition = {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: string;
  modules: string[];
  run: (ctx: TenantContext) => Promise<ScenarioResult>;
};

export type AdapterResult<T = unknown> = {
  success: boolean;
  data: T;
  duration: number;
  referenceId: string;
  message: string;
};
