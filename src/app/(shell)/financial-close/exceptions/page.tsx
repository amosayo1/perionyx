import { fcService } from "@/server/financial-close"
import type { ExceptionRecord, ExceptionSeverity, ExceptionCategory } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FCExceptionCenter } from "@/components/financial-close/fc-exception-center"

export default function FCExceptionsPage() {
  const unresolvedAlerts = fcService.alerts.getUnresolved()
  const blockedTasks = fcService.taskEngine.getBlocked()
  const unbalancedRecon = fcService.reconciliation.getUnbalanced()

  const exceptions: ExceptionRecord[] = [
    ...unresolvedAlerts.map((a) => ({
      id: a.id,
      periodId: a.periodId ?? "",
      severity: (a.severity === "emergency" ? "critical" : a.severity) as ExceptionSeverity,
      category: (a.type === "close" || a.type === "compliance" ? a.type : "reconciliation") as ExceptionCategory,
      title: a.title,
      description: a.message,
      entityType: a.type,
      entityId: a.entityId,
      assignedTo: undefined as string | undefined,
      status: "open" as const,
      resolvedAt: undefined as Date | undefined,
      resolvedBy: undefined as string | undefined,
      resolution: undefined as string | undefined,
      companyId: a.companyId,
      createdAt: a.createdAt,
      updatedAt: a.createdAt,
    })),
    ...blockedTasks.map((t) => ({
      id: `exc-${t.id}`,
      periodId: t.periodId,
      severity: t.priority === "critical" ? "critical" as ExceptionSeverity : "warning" as ExceptionSeverity,
      category: t.category as ExceptionCategory,
      title: `Blocked task: ${t.title}`,
      description: `Task ${t.taskCode} is blocked. Assignee: ${t.assignedTo}. Depends on ${t.dependsOn.length} incomplete tasks.`,
      entityType: "task",
      entityId: t.id,
      assignedTo: t.assignedTo,
      status: "open" as const,
      resolvedAt: undefined as Date | undefined,
      resolvedBy: undefined as string | undefined,
      resolution: undefined as string | undefined,
      companyId: t.companyId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    ...unbalancedRecon.map((r) => ({
      id: `exc-recon-${r.id}`,
      periodId: r.periodId,
      severity: (Math.abs(r.difference) > 10000 ? "critical" : "warning") as ExceptionSeverity,
      category: "reconciliation" as ExceptionCategory,
      title: `Unbalanced reconciliation: ${r.accountName}`,
      description: `${r.accountCode} has $${Math.abs(r.difference).toLocaleString()} difference. Status: ${r.status}.`,
      entityType: "reconciliation",
      entityId: r.id,
      assignedTo: r.preparedBy,
      status: "open" as const,
      resolvedAt: undefined as Date | undefined,
      resolvedBy: undefined as string | undefined,
      resolution: undefined as string | undefined,
      companyId: r.companyId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  ]

  return (
    <PageContainer>
      <EnterprisePageHeader title="Exception Center" description="Unresolved exceptions, blocked tasks, and unbalanced reconciliations" />
      <FCExceptionCenter exceptions={exceptions} />
    </PageContainer>
  )
}
