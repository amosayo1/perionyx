export interface WorkflowStage {
  id: string;
  label: string;
  description?: string;
  status: "pending" | "active" | "completed" | "failed" | "skipped";
  owner?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string; // ISO date
}

export interface WorkflowEvent {
  id: string;
  type: string;
  label: string;
  description?: string;
  actor?: string;
  timestamp: string;
  duration?: string; // human-readable duration from previous event
  metadata?: Record<string, unknown>;
}

export interface WorkflowStatus {
  currentOwner: string;
  waitingSince: string; // ISO date
  slaDeadline?: string; // ISO date
  riskLevel: "low" | "medium" | "high" | "critical";
  bottleneck: boolean;
  bottleneckReason?: string;
  totalElapsed: string; // human-readable
  slaRemaining?: string; // human-readable
}

export interface WorkflowData {
  stages: WorkflowStage[];
  events: WorkflowEvent[];
  status: WorkflowStatus;
  transactionId: string;
  transactionStatus: string;
  canEscalate: boolean;
  canPause: boolean;
  isPaused: boolean;
}
