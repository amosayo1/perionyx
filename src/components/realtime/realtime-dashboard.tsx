"use client";

// ---------------------------------------------------------------------------
// Real-Time Dashboard Widget — Auto-updates via SSE
// ---------------------------------------------------------------------------
// Shows live counts of workflows, approvals, notifications, and jobs.
// No page refresh required — updates arrive via EventSource.

import { useDashboardMetrics, useUnreadCount, useWorkflowStatus, useApprovalUpdates } from "@/hooks/use-realtime";

export function RealtimeDashboard() {
  const metrics = useDashboardMetrics();
  const unreadCount = useUnreadCount();
  const workflowUpdate = useWorkflowStatus();
  const approvalUpdate = useApprovalUpdates();

  const lastWorkflowEvent = workflowUpdate?.event ?? "—";
  const lastApprovalEvent = approvalUpdate?.event ?? "—";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Running Workflows"
        value={metrics?.runningWorkflows ?? "—"}
        event={lastWorkflowEvent}
      />
      <MetricCard
        label="Pending Approvals"
        value={metrics?.pendingApprovals ?? "—"}
        event={lastApprovalEvent}
      />
      <MetricCard
        label="Unread Notifications"
        value={unreadCount !== null ? String(unreadCount) : "—"}
        event="notification:count"
      />
      <MetricCard
        label="Active Jobs"
        value={metrics?.activeJobs ?? "—"}
        event={metrics?.failedJobs ? `queue:jobs (${metrics.failedJobs} failed)` : "queue:jobs"}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  event,
}: {
  label: string;
  value: string | number;
  event?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {event && (
        <div className="mt-1 text-xs text-muted-foreground truncate">
          Last: {event}
        </div>
      )}
    </div>
  );
}
