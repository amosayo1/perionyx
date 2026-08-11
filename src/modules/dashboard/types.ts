import type { WorkQueueItem } from "@/modules/work-queue/types";
import type { TodaysWorkResult } from "@/modules/todays-work/types";
import type { Decision } from "@/modules/decision-intelligence/types";

export type PersonaId = "treasurer" | "controller" | "executive" | "auditor";

export type DataMode = "live" | "demo" | "seeded";

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  delta: string | null;
  basis: string;
  deltaIsGood: boolean;
  status: "healthy" | "warning" | "critical";
  source: string;
  updatedAt: string;
  drillTarget: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  impact: string;
  reason: string;
  due: string | null;
  priority: "critical" | "high" | "medium" | "low";
  confidence?: { level: "Approve" | "Reject" | "Needs-review"; basis: string };
  target: string;
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  whyItMatters: string;
  nextStep: string;
  type: "approval" | "exception" | "payment" | "decision" | "system";
  status: "completed" | "warning";
  targetUrl: string | null;
}

export interface DashboardDataV2 {
  persona: PersonaId;
  generatedAt: string;
  dataMode: DataMode;
  metrics: DashboardKpi[];
  attentionQueue: AttentionItem[];
  decisions: Decision[];
  workQueue: WorkQueueItem[];
  workQueueTotal: number;
  todaysWork: TodaysWorkResult;
  activity: ActivityTimelineItem[];
}

export interface IDashboardService {
  getDashboardData(): Promise<DashboardDataV2>;
}
