// ---------------------------------------------------------------------------
// Enterprise Real-Time Event Types
// ---------------------------------------------------------------------------

export interface RealtimeEvent {
  channel: string;
  event: string;
  data: unknown;
  tenantId: string;
  timestamp: string;
  correlationId?: string;
}

/** All recognized real-time event names */
export const RealtimeEvents = {
  // Workflow
  WORKFLOW_CREATED: "workflow:created",
  WORKFLOW_STARTED: "workflow:started",
  WORKFLOW_COMPLETED: "workflow:completed",
  WORKFLOW_FAILED: "workflow:failed",
  WORKFLOW_CANCELLED: "workflow:cancelled",
  WORKFLOW_PAUSED: "workflow:paused",
  WORKFLOW_RESUMED: "workflow:resumed",
  WORKFLOW_PROGRESS: "workflow:progress",
  WORKFLOW_STEP_STARTED: "workflow:step:started",
  WORKFLOW_STEP_COMPLETED: "workflow:step:completed",
  WORKFLOW_STEP_FAILED: "workflow:step:failed",

  // Approval
  APPROVAL_REQUESTED: "approval:requested",
  APPROVAL_GRANTED: "approval:granted",
  APPROVAL_REJECTED: "approval:rejected",
  APPROVAL_ESCALATED: "approval:escalated",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_COUNT: "notification:count",

  // Queue / Background Jobs
  QUEUE_JOB_STARTED: "queue:job:started",
  QUEUE_JOB_COMPLETED: "queue:job:completed",
  QUEUE_JOB_FAILED: "queue:job:failed",
  QUEUE_JOB_PROGRESS: "queue:job:progress",

  // Treasury
  TREASURY_BALANCE_UPDATED: "treasury:balance:updated",
  TREASURY_TRANSFER_COMPLETED: "treasury:transfer:completed",

  // Connector
  CONNECTOR_SYNC_STARTED: "connector:sync:started",
  CONNECTOR_SYNC_COMPLETED: "connector:sync:completed",
  CONNECTOR_SYNC_FAILED: "connector:sync:failed",
  CONNECTOR_HEALTH_CHANGED: "connector:health:changed",

  // System
  SYSTEM_HEALTH: "system:health",
  SYSTEM_HEARTBEAT: "system:heartbeat",

  // Dashboard
  DASHBOARD_METRICS: "dashboard:metrics",

  // Audit
  AUDIT_HIGH_SEVERITY: "audit:high-severity",
} as const;

export type RealtimeEventName = (typeof RealtimeEvents)[keyof typeof RealtimeEvents];

/** All recognized event channels (domains) */
export const RealtimeChannels = {
  WORKFLOW: "workflow",
  APPROVAL: "approval",
  NOTIFICATION: "notification",
  QUEUE: "queue",
  TREASURY: "treasury",
  CONNECTOR: "connector",
  SYSTEM: "system",
  DASHBOARD: "dashboard",
  AUDIT: "audit",
} as const;

export type RealtimeChannelName = (typeof RealtimeChannels)[keyof typeof RealtimeChannels];

// ---------------------------------------------------------------------------
// Typed Payloads
// ---------------------------------------------------------------------------
export interface WorkflowEventPayload {
  instanceId: string;
  definitionId: string;
  definitionName: string;
  status: string;
}

export interface WorkflowStepEventPayload {
  instanceId: string;
  stepId: string;
  stepType: string;
  status: string;
  progress?: number;
  label?: string;
}

export interface ApprovalEventPayload {
  transactionId: string;
  status: string;
  approverId?: string;
  approverRole?: string;
  amount?: number;
  currency?: string;
}

export interface NotificationEventPayload {
  notificationId: string;
  type: string;
  title: string;
  userId: string;
}

export interface NotificationCountPayload {
  unreadCount: number;
}

export interface QueueJobEventPayload {
  queueName: string;
  jobId: string;
  state: string;
  progress?: number;
}

export interface TreasuryBalancePayload {
  accountId: string;
  currency: string;
  balance: string;
}

export interface ConnectorEventPayload {
  connectorId: string;
  connectorKind: string;
  status: string;
}

export interface SystemHealthPayload {
  healthy: boolean;
  services: Record<string, boolean>;
}

export interface DashboardMetricsPayload {
  runningWorkflows: number;
  pendingApprovals: number;
  unreadNotifications: number;
  activeJobs: number;
  failedJobs: number;
}

export type RealtimePayload =
  | WorkflowEventPayload
  | WorkflowStepEventPayload
  | ApprovalEventPayload
  | NotificationEventPayload
  | NotificationCountPayload
  | QueueJobEventPayload
  | TreasuryBalancePayload
  | ConnectorEventPayload
  | SystemHealthPayload
  | DashboardMetricsPayload;
