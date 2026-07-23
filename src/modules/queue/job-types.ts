import type { TenantContext } from "@/server/context/tenant-context";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface BaseJobPayload {
  tenantId: string;
  userId: string;
  correlationId: string;
  requestId?: string;
}

export interface NotificationJobPayload extends BaseJobPayload {
  type: "notification-email" | "notification-slack" | "notification-connector";
  companyId: string;
  userId: string;
  eventType: string;
  title: string;
  message?: string;
  metadata?: Record<string, unknown>;
  link?: string;
  channelId?: string;
  channelType?: string;
  recipientEmail?: string;
  webhookUrl?: string;
  connectorId?: string;
}

export interface WorkflowJobPayload extends BaseJobPayload {
  type: "workflow-execute";
  instanceId: string;
  definitionId: string;
  mode: "start" | "step" | "resume";
  stepId?: string;
  input?: Record<string, unknown>;
}

export interface AiJobPayload extends BaseJobPayload {
  type: "ai-analysis" | "ai-forecast" | "ai-narrative" | "ai-extraction" | "ai-risk";
  companyId: string;
  input: Record<string, unknown>;
  model?: string;
}

export interface ReportJobPayload extends BaseJobPayload {
  type: "report-generate";
  companyId: string;
  reportType: string;
  format: "csv" | "json";
  filters?: Record<string, unknown>;
}

export interface ConnectorSyncJobPayload extends BaseJobPayload {
  type: "connector-sync";
  connectorId: string;
  companyId: string;
  syncType: string;
}

export interface FxSyncJobPayload extends BaseJobPayload {
  type: "fx-sync";
  force?: boolean;
}

export type JobPayload =
  | NotificationJobPayload
  | WorkflowJobPayload
  | AiJobPayload
  | ReportJobPayload
  | ConnectorSyncJobPayload
  | FxSyncJobPayload
  | Record<string, unknown>;

export interface ProgressUpdate {
  jobId: string;
  queueName: string;
  progress: number;
  status: JobStatus;
  message?: string;
  error?: string;
}

export function createBasePayload(ctx: TenantContext): Pick<BaseJobPayload, "tenantId" | "userId" | "correlationId"> {
  return {
    tenantId: ctx.companyId,
    userId: ctx.userId,
    correlationId: crypto.randomUUID(),
  };
}
