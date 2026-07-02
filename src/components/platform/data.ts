import type {
  PlatformHealthMetric,
  PlatformService,
  BackgroundJob,
  QueueData,
  Integration,
  WebhookEndpoint,
  ScheduledTask,
  PlatformEvent,
} from "./types";

export const healthMetrics: PlatformHealthMetric[] = [
  {
    id: "platform-status",
    title: "Platform Status",
    value: "Operational",
    status: "healthy",
    trend: "up",
    trendLabel: "All systems nominal",
    insight: "All core services are operating within normal parameters.",
    sparklineData: [98, 99, 98, 100, 99, 99, 100, 98, 99, 100, 99, 100],
  },
  {
    id: "api-availability",
    title: "API Availability",
    value: "99.97%",
    status: "healthy",
    trend: "up",
    trendLabel: "+0.02%",
    insight: "API gateway reporting 99.97% uptime over the last 30 days.",
    sparklineData: [99.9, 99.9, 99.95, 99.95, 99.97, 99.97],
  },
  {
    id: "queue-health",
    title: "Queue Health",
    value: "Healthy",
    status: "healthy",
    trend: "neutral",
    trendLabel: "Stable",
    insight: "All operational queues processing within expected parameters.",
    sparklineData: [92, 95, 94, 96, 95, 97],
  },
  {
    id: "job-success",
    title: "Job Success Rate",
    value: "98.4%",
    status: "healthy",
    trend: "up",
    trendLabel: "+1.2%",
    insight: "Background job success rate improved after recent retry optimization.",
    sparklineData: [94, 95, 96, 97, 98, 98.4],
  },
  {
    id: "webhook-success",
    title: "Webhook Success Rate",
    value: "96.2%",
    status: "warning",
    trend: "down",
    trendLabel: "-2.1%",
    insight: "Webhook delivery success declined due to upstream endpoint timeouts.",
    sparklineData: [98, 97, 97, 96, 95, 96.2],
  },
  {
    id: "integration-status",
    title: "Integration Status",
    value: "7 / 8",
    status: "warning",
    trend: "neutral",
    trendLabel: "1 degraded",
    insight: "One integration (Silvergate Bank) reporting degraded connectivity.",
    sparklineData: [8, 8, 8, 7, 7, 7],
  },
];

export const platformServices: PlatformService[] = [
  { id: "svc-approval", name: "Approval Engine", status: "healthy", description: "Processing all approval workflows within SLA", latency: "45ms", lastChecked: "15s ago", uptime: "99.98%" },
  { id: "svc-policy", name: "Policy Engine", status: "healthy", description: "All policy rules evaluating normally", latency: "32ms", lastChecked: "15s ago", uptime: "99.99%" },
  { id: "svc-ledger", name: "Ledger Engine", status: "healthy", description: "All ledger postings processing on schedule", latency: "78ms", lastChecked: "15s ago", uptime: "99.95%" },
  { id: "svc-treasury", name: "Treasury Engine", status: "warning", description: "Settlement batch delayed — manual review flagged", latency: "210ms", lastChecked: "15s ago", uptime: "99.87%" },
  { id: "svc-auth", name: "Authentication", status: "healthy", description: "Auth service operational, no failed logins detected", latency: "28ms", lastChecked: "10s ago", uptime: "99.99%" },
  { id: "svc-notifications", name: "Notification Service", status: "healthy", description: "All notification channels operational", latency: "55ms", lastChecked: "15s ago", uptime: "99.92%" },
  { id: "svc-audit", name: "Audit Service", status: "healthy", description: "All audit events being recorded in real-time", latency: "35ms", lastChecked: "10s ago", uptime: "99.99%" },
  { id: "svc-reporting", name: "Reporting Service", status: "healthy", description: "Report generation and export functional", latency: "120ms", lastChecked: "30s ago", uptime: "99.88%" },
];

export const backgroundJobs: BackgroundJob[] = [
  { id: "job-settlement", name: "Settlement Processing", status: "running", avgDuration: "4.2m", lastExecution: "Running", description: "Processing batch BATCH-441 settlement instructions" },
  { id: "job-ledger", name: "Ledger Posting", status: "completed", avgDuration: "1.8m", lastExecution: "2m ago", description: "Posted 24 journal entries from transaction queue" },
  { id: "job-treasury", name: "Treasury Sync", status: "queued", avgDuration: "3.5m", lastExecution: "15m ago", description: "Synchronizing balances across 8 connected banks" },
  { id: "job-risk", name: "Risk Evaluation", status: "completed", avgDuration: "2.1m", lastExecution: "5m ago", description: "Scored 48 transactions for risk classification" },
  { id: "job-audit", name: "Audit Archiving", status: "completed", avgDuration: "6.7m", lastExecution: "45m ago", description: "Archived 1,204 audit events to cold storage" },
  { id: "job-notifications", name: "Notification Dispatch", status: "failed", avgDuration: "0.8m", lastExecution: "12m ago", description: "Failed to dispatch 3 webhook notifications — retrying" },
];

export const queueData: QueueData[] = [
  { id: "q-approval", name: "Approval Queue", waiting: 8, processing: 2, avgProcessingTime: "4.2m", oldestItem: "4h 22m", health: "healthy" },
  { id: "q-settlement", name: "Settlement Queue", waiting: 12, processing: 3, avgProcessingTime: "3.8m", oldestItem: "45m", health: "warning" },
  { id: "q-ledger", name: "Ledger Queue", waiting: 4, processing: 1, avgProcessingTime: "1.8m", oldestItem: "12m", health: "healthy" },
  { id: "q-webhook", name: "Webhook Queue", waiting: 24, processing: 5, avgProcessingTime: "6.2s", oldestItem: "22m", health: "warning" },
  { id: "q-notification", name: "Notification Queue", waiting: 97, processing: 8, avgProcessingTime: "1.2s", oldestItem: "12m", health: "critical" },
  { id: "q-policy", name: "Policy Queue", waiting: 2, processing: 1, avgProcessingTime: "0.8s", oldestItem: "3m", health: "healthy" },
];

export const integrations: Integration[] = [
  { id: "int-banks", name: "Banking (8 connections)", status: "warning", lastSync: "2m ago", description: "Silvergate Bank reporting degraded latency (2.4s)" },
  { id: "int-erp", name: "ERP (SAP)", status: "connected", lastSync: "1m ago", description: "Real-time synchronization active" },
  { id: "int-accounting", name: "Accounting (NetSuite)", status: "connected", lastSync: "3m ago", description: "All journal entries synced" },
  { id: "int-idp", name: "Identity Provider (Okta)", status: "connected", lastSync: "30s ago", description: "SSO and SCIM provisioning active" },
  { id: "int-email", name: "Email (SendGrid)", status: "connected", lastSync: "1m ago", description: "Transactional email delivery operational" },
  { id: "int-slack", name: "Slack", status: "connected", lastSync: "2m ago", description: "Notification integration active" },
  { id: "int-teams", name: "Microsoft Teams", status: "connected", lastSync: "5m ago", description: "Webhook integration active" },
  { id: "int-api", name: "Developer APIs", status: "connected", lastSync: "10s ago", description: "All API endpoints responding within SLA" },
];

export const webhookEndpoints: WebhookEndpoint[] = [
  { id: "wh-stripe", name: "Stripe", successRate: 99.8, retries: 0, failures: 1, avgLatency: "120ms", lastDelivery: "2m ago", status: "connected" },
  { id: "wh-sap", name: "SAP", successRate: 99.2, retries: 2, failures: 3, avgLatency: "450ms", lastDelivery: "5m ago", status: "connected" },
  { id: "wh-oracle", name: "Oracle", successRate: 97.8, retries: 8, failures: 5, avgLatency: "890ms", lastDelivery: "8m ago", status: "warning" },
  { id: "wh-netsuite", name: "NetSuite", successRate: 98.5, retries: 4, failures: 3, avgLatency: "340ms", lastDelivery: "3m ago", status: "connected" },
  { id: "wh-dynamics", name: "Microsoft Dynamics", successRate: 96.1, retries: 12, failures: 7, avgLatency: "1.2s", lastDelivery: "12m ago", status: "warning" },
];

export const scheduledTasks: ScheduledTask[] = [
  { id: "task-recon", name: "Nightly Reconciliation", status: "completed", nextRun: "Today 23:00", lastRun: "Today 00:12", duration: "8.4m", owner: "Finance Ops" },
  { id: "task-fx", name: "FX Rate Refresh", status: "completed", nextRun: "Every 4h", lastRun: "20m ago", duration: "1.2m", owner: "System" },
  { id: "task-treasury", name: "Treasury Snapshot", status: "completed", nextRun: "Every 1h", lastRun: "18m ago", duration: "2.5m", owner: "System" },
  { id: "task-ledger-snap", name: "Ledger Snapshot", status: "running", nextRun: "Running", lastRun: "Running", duration: "3.1m", owner: "System" },
  { id: "task-audit", name: "Audit Archive", status: "queued", nextRun: "Today 22:00", lastRun: "Yesterday 22:00", duration: "6.7m", owner: "System" },
  { id: "task-risk", name: "Risk Scan", status: "completed", nextRun: "Every 30m", lastRun: "4m ago", duration: "1.8m", owner: "Risk Team" },
];

export const platformEvents: PlatformEvent[] = [
  { id: "evt-1", type: "deployment", severity: "info", title: "Platform Deployed", description: "v2.14.3 deployed to production — ledger engine optimization", service: "Ledger Engine", timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "evt-2", type: "restart", severity: "info", title: "Service Restart", description: "Treasury Engine restarted after scheduled maintenance window", service: "Treasury Engine", timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "evt-3", type: "queue_spike", severity: "warning", title: "Queue Spike Detected", description: "Notification queue surged to 142 items — auto-scaled consumer pool", service: "Notification Service", timestamp: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: "evt-4", type: "webhook_failure", severity: "error", title: "Webhook Delivery Failure", description: "3 consecutive failures to Microsoft Dynamics endpoint — retry scheduled", service: "Webhook Service", timestamp: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: "evt-5", type: "recovery", severity: "success", title: "Service Recovered", description: "Silvergate Bank connection restored after transient network issue", service: "Banking Integration", timestamp: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: "evt-6", type: "job_retry", severity: "warning", title: "Job Retry Scheduled", description: "Notification Dispatch job failed — retry in 5 minutes", service: "Notification Service", timestamp: new Date(Date.now() - 50 * 60000).toISOString() },
  { id: "evt-7", type: "cache_refresh", severity: "info", title: "Cache Refreshed", description: "Policy engine rule cache refreshed after rule update", service: "Policy Engine", timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "evt-8", type: "config_update", severity: "info", title: "Configuration Updated", description: "Webhook retry policy updated: max retries 5 → 8, backoff 30s → 60s", service: "Webhook Service", timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
];
