import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCKPIDashboard from "@/components/financial-close/fc-kpi-dashboard"
import { FCExecutiveInsights } from "@/components/financial-close/fc-executive-insights"

export default function FCAnalyticsPage() {
  const metrics = fcService.analytics.getAllMetrics()
  const summary = fcService.getExecutiveSummary()
  const periods = fcService.closeManagement.getAll()
  const tasks = fcService.taskEngine.getAll()
  const approvals = fcService.approvals.getAll()
  const exceptions = fcService.alerts.getUnresolved().map((a) => ({
    id: a.id,
    periodId: a.periodId ?? "",
    severity: (a.severity === "emergency" ? "critical" : a.severity) as "info" | "warning" | "critical" | "blocker",
    category: "reconciliation" as const,
    title: a.title,
    description: a.message,
    assignedTo: undefined as string | undefined,
    companyId: a.companyId,
    createdAt: a.createdAt,
    updatedAt: a.createdAt,
    resolvedAt: undefined as Date | undefined,
    resolvedBy: undefined as string | undefined,
    resolution: undefined as string | undefined,
    status: "open" as const,
  }))
  const reconciliations = fcService.reconciliation.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Analytics" description="Close performance metrics and insights" />
      <FCKPIDashboard metrics={metrics} />
      <FCExecutiveInsights summary={summary} periods={periods} tasks={tasks} approvals={approvals} exceptions={exceptions} reconciliations={reconciliations} />
    </PageContainer>
  )
}
